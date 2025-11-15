const asyncHandler = require('../middleware/asyncHandler.js');
const Seller = require('../models/sellerModel.js');
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Notification = require('../models/notificationModel.js');
const SellerHistory = require('../models/sellerHistoryModel.js');

// @desc    Get details for a specific seller (for admin modal view)
// @route   GET /api/admin/sellers/details/:id
// @access  Private/Admin
const getSellerDetailsForAdmin = asyncHandler(async (req, res) => {
    const sellerId = req.params.id;

    // 1. Fetch Seller with populated User object
    const seller = await Seller.findById(sellerId)
        .populate('user', 'name email role') // FIX: Populate the linked user (owner) details
        .lean();

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // 2. Fetch Seller's Products
    const products = await Product.find({ seller: sellerId })
        .select('name price status images category brand material');

    // 3. Fetch Seller's History, populating the 'changedBy' field (the admin/user who made the change)
    const history = await SellerHistory.find({ seller: sellerId })
        .populate('changedBy', 'name role') // FIX: Populate the admin/user who made the history entry
        .sort({ createdAt: -1 });

    res.json({
        seller: seller,
        products: products,
        history: history,
    });
});

// @desc    Get summary statistics for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({});
    const totalSellers = await Seller.countDocuments({ status: 'approved' });
    const totalProducts = await Product.countDocuments({ status: 'approved' });
    const pendingSellers = await Seller.countDocuments({ status: 'pending' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });
    
    res.json({
        totalUsers,
        totalSellers,
        totalProducts,
        pendingApprovals: pendingSellers + pendingProducts,
    });
});

// @desc    Get chart data (users and products over time)
// @route   GET /api/admin/chart-data
// @access  Private/Admin
const getAdminChartData = asyncHandler(async (req, res) => {
    const { period } = req.query;

    let matchCriteria = {};
    const now = new Date();
    
    if (period === 'week') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        matchCriteria = { createdAt: { $gte: oneWeekAgo } };
    } else if (period === 'month') {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        matchCriteria = { createdAt: { $gte: oneMonthAgo } };
    } 
    // If period is 'all_time', no matchCriteria is needed (fetches all data)

    // Helper function to aggregate data
    const aggregateData = async (model, fieldName) => {
        let groupByFormat;
        if (period === 'week' || period === 'month') {
             // Group by date (YYYY-MM-DD) for smaller periods
            groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        } else {
             // Group by month/year (YYYY-MM) for 'all_time'
            groupByFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        }

        const data = await model.aggregate([
            { $match: matchCriteria },
            {
                $group: {
                    _id: groupByFormat,
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    [fieldName]: "$count"
                }
            },
            { $sort: { date: 1 } }
        ]);
        return data;
    };

    const usersData = await aggregateData(User, 'users');
    const productsData = await aggregateData(Product, 'products');

    // Merge data based on date
    const chartDataMap = new Map();
    [...usersData, ...productsData].forEach(item => {
        const date = item.date;
        if (!chartDataMap.has(date)) {
            chartDataMap.set(date, { date, users: 0, products: 0 });
        }
        chartDataMap.set(date, { ...chartDataMap.get(date), ...item });
    });

    const mergedData = Array.from(chartDataMap.values());
    res.json(mergedData);
});

// @desc    Get all users for management table
// @route   GET /api/admin/users
// @access  Private/Admin
const adminGetAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
});

// @desc    Get all sellers for management table
// @route   GET /api/admin/sellers/all
// @access  Private/Admin
const adminGetAllSellers = asyncHandler(async (req, res) => {
    // Populate the seller's user ID to get owner name/email for the table view
    const sellers = await Seller.find({})
        .populate('user', 'name email') // FIX: Ensure user details are populated
        .sort({ createdAt: -1 });
    res.json(sellers);
});

// @desc    Get all products for management table
// @route   GET /api/admin/products/all
// @access  Private/Admin
const adminGetAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})
        .populate({ path: 'seller', select: 'businessName' }) // Optionally populate seller for display
        .sort({ createdAt: -1 });
    res.json(products);
});

// @desc    Get pending seller and product approvals
// @route   GET /api/admin/approvals
// @access  Private/Admin
const getPendingApprovals = asyncHandler(async (req, res) => {
    // 1. Pending Sellers
    const pendingSellers = await Seller.find({ status: 'pending' })
        .select('businessName') // Select only what's needed for the approval table
        .sort({ createdAt: 1 });

    // 2. Pending Products
    const pendingProducts = await Product.find({ status: 'pending' })
        .select('name seller images')
        .populate('seller', 'businessName') // Populate seller name for the table view
        .sort({ createdAt: 1 });

    res.json({
        sellers: pendingSellers,
        products: pendingProducts,
    });
});

// @desc    Update Seller Status (Approve/Reject/Suspend)
// @route   PUT /api/admin/sellers/:id/status
// @access  Private/Admin
const updateSellerStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // status: 'approved', 'rejected', 'suspended'
    const sellerId = req.params.id;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    // Capture old status for history
    const oldStatus = seller.status;

    // Update status
    seller.status = status;
    await seller.save();

    // Log history (optional, but good practice)
    await SellerHistory.create({
        seller: seller._id,
        changedBy: req.user._id, // Assumes user ID is available from auth middleware
        notes: `Status changed from ${oldStatus} to ${status}.`,
        changes: [{ field: 'status', oldValue: oldStatus, newValue: status }]
    });

    // Notify user
    await Notification.create({
        recipient: seller.user,
        message: `Your seller application status has been updated to: ${status}.`,
        type: 'status',
    });

    res.json({ message: `Seller ${sellerId} status updated to ${status}` });
});

// @desc    Update Product Status (Approve/Reject)
// @route   PUT /api/admin/products/:id/status
// @access  Private/Admin
const updateProductStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // status: 'approved', 'rejected'
    const productId = req.params.id;

    const product = await Product.findById(productId).populate('seller');
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    product.status = status;
    await product.save();

    // Notify seller
    await Notification.create({
        recipient: product.seller.user, // Assuming product.seller has a user field
        message: `Your product "${product.name}" status has been updated to: ${status}.`,
        type: 'product_status',
    });

    res.json({ message: `Product ${productId} status updated to ${status}` });
});


// Export all controller functions
module.exports = {
    getSellerDetailsForAdmin,
    getAdminDashboardStats,
    getAdminChartData,
    adminGetAllUsers,
    adminGetAllSellers,
    adminGetAllProducts,
    getPendingApprovals,
    updateSellerStatus,
    updateProductStatus,
};