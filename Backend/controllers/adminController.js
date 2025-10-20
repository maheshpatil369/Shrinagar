// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/controllers/adminController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Seller = require('../models/sellerModel.js');
const SellerHistory = require('../models/sellerHistoryModel.js');
const Notification = require('../models/notificationModel.js'); // Import Notification model

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
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

// @desc    Get all pending sellers and products for the approval inbox
// @route   GET /api/admin/approvals
// @access  Private/Admin
const getPendingApprovals = asyncHandler(async (req, res) => {
    const pendingSellers = await Seller.find({ status: 'pending' }).populate('user', 'name email');
    
    const pendingProducts = await Product.find({ status: 'pending' }).populate({
        path: 'seller', // This is the User model
        select: 'name sellerProfile',
        populate: {
            path: 'sellerProfile', // Now populate the Seller model from the User
            select: 'businessName'
        }
    });

    const productsWithSellerName = pendingProducts.map(p => {
        const productObj = p.toObject();
        // @ts-ignore
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


// @desc    Get a seller's full details, products, and history for admin review
// @route   GET /api/admin/sellers/:id
// @access  Private/Admin
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


// @desc    Get a seller's full history
// @route   GET /api/admin/sellers/:id/history
// @access  Private/Admin
const getSellerHistory = asyncHandler(async (req, res) => {
    const history = await SellerHistory.find({ sellerId: req.params.id }).sort({ createdAt: -1 }).populate('changedBy', 'name role');
    res.json(history);
});

// @desc    Get all products for admin view
// @route   GET /api/admin/products
// @access  Private/Admin
const adminGetAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate({
        path: 'seller',
        select: 'name',
    });
    res.json(products);
});

// @desc    Get all sellers for admin
const adminGetAllSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find({}).populate('user', 'name email');
  res.json(sellers);
});

// @desc    Update seller status and log history correctly
const adminUpdateSellerStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
        res.status(404); throw new Error('Seller not found');
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
    
    // Create a notification for the seller
    await Notification.create({
        user: seller.user,
        message: `Your seller profile has been ${status}.`,
        link: '/seller'
    });
    
    await seller.save();
    res.json(seller);
});

// @desc    Update product status
const adminUpdateProductStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
        product.status = status;
        
        // Create a notification for the seller
        await Notification.create({
            user: product.seller,
            message: `Your product "${product.name}" has been ${status}.`,
            link: '/seller'
        });

        await product.save();
        res.json(product);
    } else {
        res.status(404); throw new Error('Product not found');
    }
});

// @desc    Delete a product by admin
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

// @desc    Get all users (non-admins)
const adminGetAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } });
    res.json(users);
});

// @desc    Update a user's role
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

// @desc    Delete a user by admin
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

module.exports = {
    getDashboardStats,
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
};

