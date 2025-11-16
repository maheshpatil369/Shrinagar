// maheshpatil369/shrinagar/Shrinagar-b9ec823c114ce2847f5e61759f8372f4bfe46c3b/Backend/controllers/adminController.js

const asyncHandler = require('../middleware/asyncHandler.js');
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Seller = require('../models/sellerModel.js');
const SellerHistory = require('../models/sellerHistoryModel.js');
const Notification = require('../models/notificationModel.js'); // Import Notification model

// ===================================================================
// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
// ===================================================================
const getDashboardStats = asyncHandler(async (req, res) => {
    // Use countDocuments for efficient counting without fetching all data
    const totalUsers = await User.countDocuments();
    const totalSellers = await Seller.countDocuments();
    const totalProducts = await Product.countDocuments();

    const pendingSellersCount = await Seller.countDocuments({ status: 'pending' });
    const pendingProductsCount = await Product.countDocuments({ status: 'pending' });

    res.json({
        totalUsers,
        totalSellers,
        totalProducts,
        pendingApprovals: pendingSellersCount + pendingProductsCount,
    });
});

// ===================================================================
// @desc    Get chart data for dashboard
// @route   GET /api/admin/chart-data
// @access  Private/Admin
// ===================================================================
const getChartData = asyncHandler(async (req, res) => {
    const { period = 'week' } = req.query;
    let startDate = new Date();
    let groupByFormat = "%Y-%m-%d"; // Daily

    switch (period) {
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            groupByFormat = "%Y-%m"; // Monthly
            break;
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'week':
        default:
            startDate.setDate(startDate.getDate() - 7);
            break;
    }

    const usersData = await User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    const productsData = await Product.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);

    // Combine data
    const combinedData = {};
    usersData.forEach(item => {
        if (!combinedData[item._id]) combinedData[item._id] = { date: item._id, users: 0, products: 0 };
        combinedData[item._id].users = item.count;
    });
    productsData.forEach(item => {
        if (!combinedData[item._id]) combinedData[item._id] = { date: item._id, users: 0, products: 0 };
        combinedData[item._id].products = item.count;
    });

    res.json(Object.values(combinedData).sort((a, b) => new Date(a.date) - new Date(b.date)));
});

// ===================================================================
// @desc    Get all pending sellers and products for the approval inbox
// @route   GET /api/admin/approvals
// @access  Private/Admin
// ===================================================================
const getPendingApprovals = asyncHandler(async (req, res) => {
    const pendingSellers = await Seller.find({ status: 'pending' }).populate('user', 'name email');

    const pendingProducts = await Product.find({ status: 'pending' }).populate({
        path: 'seller',
        select: 'name sellerProfile',
        populate: {
            path: 'sellerProfile',
            select: 'businessName'
        }
    });

    const productsWithSellerName = pendingProducts.map(p => {
        const productObj = p.toObject();
        const businessName = p.seller?.sellerProfile?.businessName || p.seller?.name;
        return {
            ...productObj,
            seller: {
                _id: productObj.seller._id,
                businessName: businessName
            }
        };
    });

    res.json({ sellers: pendingSellers, products: productsWithSellerName });
});

// ===================================================================
// @desc    Get a seller's full details, products, and history for admin review
// @route   GET /api/admin/sellers/:id
// @access  Private/Admin
// ===================================================================
const getSellerDetailsForAdmin = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.params.id).populate('user', 'name email');
    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    const products = await Product.find({ seller: seller.user });
    const history = await SellerHistory.find({ sellerId: req.params.id }).sort({ createdAt: -1 }).populate('changedBy', 'name role');

    res.json({ seller, products, history });
});

// ===================================================================
// @desc    Get a seller's full history
// @route   GET /api/admin/sellers/:id/history
// @access  Private/Admin
// ===================================================================
const getSellerHistory = asyncHandler(async (req, res) => {
    const history = await SellerHistory.find({ sellerId: req.params.id }).sort({ createdAt: -1 }).populate('changedBy', 'name role');
    res.json(history);
});

// ===================================================================
// @desc    Get all products for admin view
// @route   GET /api/admin/products
// @access  Private/Admin
// ===================================================================
const adminGetAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate({
        path: 'seller',
        select: 'name',
    });
    res.json(products);
});

// ===================================================================
// @desc    Get all sellers for admin
// @access  Private/Admin
// ===================================================================
const adminGetAllSellers = asyncHandler(async (req, res) => {
    const sellers = await Seller.find({}).populate('user', 'name email');
    res.json(sellers);
});

// ===================================================================
// @desc    Update seller status and log history
// @access  Private/Admin
// ===================================================================
const adminUpdateSellerStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    const previousStatus = seller.status;
    seller.status = status;

    await SellerHistory.create({
        sellerId: seller._id,
        changedBy: req.user._id,
        changes: [{
            field: 'status',
            oldValue: previousStatus,
            newValue: status
        }],
        notes: `Seller status changed to ${status} by admin.`
    });

    await Notification.create({
        user: seller.user,
        message: `Your seller profile has been ${status}.`,
        link: '/seller'
    });

    await seller.save();
    res.json(seller);
});

// ===================================================================
// @desc    Update product status
// @access  Private/Admin
// ===================================================================
const adminUpdateProductStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        product.status = status;

        await Notification.create({
            user: product.seller,
            message: `Your product "${product.name}" has been ${status}.`,
            link: '/seller'
        });

        await product.save();
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// ===================================================================
// @desc    Delete a product by admin
// @access  Private/Admin
// ===================================================================
const adminDeleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// ===================================================================
// @desc    Get all users (non-admins)
// @route   GET /api/admin/users
// @access  Private/Admin
// ===================================================================
const adminGetAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } });
    res.json(users);
});

// ===================================================================
// @desc    Update a user's role
// @access  Private/Admin
// ===================================================================
const adminUpdateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
        user.role = role;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// ===================================================================
// @desc    Delete a user by admin
// @access  Private/Admin
// ===================================================================
const adminDeleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete an admin user');
        }
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// ===================================================================
// @desc    Get all product reviews for Admin Management (NEW)
// @route   GET /api/admin/reviews
// @access  Private/Admin
// ===================================================================
const adminGetAllReviews = asyncHandler(async (req, res) => {
    // Aggregate to extract all reviews from all products
    const reviews = await Product.aggregate([
        // Match only products that have at least one review
        { $match: { 'reviews.0': { $exists: true } } },
        // Unwind the reviews array to get one document per review
        { $unwind: '$reviews' },
        // Project the desired fields
        {
            $project: {
                _id: '$reviews._id', // The review ID
                productId: '$_id', // The product ID
                productName: '$name',
                productSeller: '$seller',
                rating: '$reviews.rating',
                comment: '$reviews.comment',
                userName: '$reviews.name', // User name saved in the review schema
                userId: '$reviews.user', // User ID who wrote the review
                createdAt: '$reviews.createdAt',
            },
        },
        // Optionally, sort by creation date descending
        { $sort: { createdAt: -1 } } 
    ]);

    // Populate seller information manually if needed, or rely on the frontend
    // to match productSeller ID with the seller list. For simplicity and 
    // performance, we return the raw aggregation result.
    
    // However, we should populate the seller's business name for display if possible.
    // For large data sets, this lookup might be slow. Since the frontend only 
    // needs the review data and product ID, we will leave it as is and the 
    // frontend can handle linking if it has the full seller list.
    
    res.json(reviews);
});


// ===================================================================
// @desc    Delete a specific review by Admin (NEW)
// @route   DELETE /api/admin/reviews/:productId/:reviewId
// @access  Private/Admin
// ===================================================================
const adminDeleteReview = asyncHandler(async (req, res) => {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    const reviewIndex = product.reviews.findIndex(
        (r) => r._id.toString() === reviewId.toString()
    );

    if (reviewIndex === -1) {
        res.status(404);
        throw new Error('Review not found');
    }

    // Remove the review from the array
    product.reviews.splice(reviewIndex, 1);

    // Recalculate ratings
    product.numReviews = product.reviews.length;
    if (product.numReviews > 0) {
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;
    } else {
        product.rating = 0;
    }

    await product.save();
    res.json({ message: 'Review successfully deleted by Admin.' });
});


// ===================================================================
// Exports
// ===================================================================
module.exports = {
    getDashboardStats,
    getChartData,
    getPendingApprovals,
    getSellerDetailsForAdmin,
    getSellerHistory,
    adminGetAllSellers,
    adminUpdateSellerStatus,
    adminGetAllProducts,
    adminUpdateProductStatus,
    adminDeleteProduct,
    adminGetAllUsers,
    adminUpdateUserRole,
    adminDeleteUser,
    // --- NEW EXPORTS ---
    adminGetAllReviews,
    adminDeleteReview,
};