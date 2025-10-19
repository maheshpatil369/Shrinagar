// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/controllers/adminController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Seller = require('../models/sellerModel.js');
const Notification = require('../models/notificationModel.js');
const SellerHistory = require('../models/sellerHistoryModel.js');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    // ... implementation remains the same
});

// @desc    Get all pending sellers and products for the approval inbox
// @route   GET /api/admin/approvals
// @access  Private/Admin
const getPendingApprovals = asyncHandler(async (req, res) => {
    const pendingSellers = await Seller.find({ status: 'pending' }).populate('user', 'name email');
    const pendingProducts = await Product.find({ status: 'pending' }).populate('seller', 'name');
    res.json({ sellers: pendingSellers, products: pendingProducts });
});

// @desc    Get a seller's full history
// @route   GET /api/admin/sellers/:id/history
// @access  Private/Admin
const getSellerHistory = asyncHandler(async (req, res) => {
    const history = await SellerHistory.find({ seller: req.params.id }).sort({ createdAt: -1 });
    res.json(history);
});

// --- CORRECTED: This function now lives in the admin controller ---
// @desc    Get all products for admin view
// @route   GET /api/admin/products
// @access  Private/Admin
const adminGetAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('seller', 'name');
    res.json(products);
});

// All other admin functions for updating status, deleting users, etc., remain here...
// @desc    Get all sellers for admin
const adminGetAllSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find({}).populate('user', 'name email');
  res.json(sellers);
});

// @desc    Get seller by ID for admin
const adminGetSellerById = asyncHandler(async (req, res) => {
    const seller = await Seller.findById(req.params.id).populate('user', 'name email');
    if (seller) {
        res.json(seller);
    } else {
        res.status(404);
        throw new Error('Seller not found');
    }
});

// @desc    Update seller status
const adminUpdateSellerStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
        res.status(404); throw new Error('Seller not found');
    }

    const previousStatus = seller.status;
    seller.status = status;
    
    await SellerHistory.create({
        seller: seller._id,
        changedBy: 'Admin',
        user: req.user._id,
        changes: { status: { from: previousStatus, to: status } },
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
        await product.save();
        res.json(product);
    } else {
        res.status(404); throw new Error('Product not found');
    }
});

// Other admin functions (deleteProduct, getAllUsers, etc.) go here...
const adminDeleteProduct = asyncHandler(async (req, res) => { /* ... */ });
const adminGetAllUsers = asyncHandler(async (req, res) => { /* ... */ });
const adminUpdateUserRole = asyncHandler(async (req, res) => { /* ... */ });
const adminDeleteUser = asyncHandler(async (req, res) => { /* ... */ });


module.exports = {
    getDashboardStats,
    getPendingApprovals,
    getSellerHistory,
    adminGetAllSellers,
    adminGetSellerById,
    adminUpdateSellerStatus,
    adminGetAllProducts, // Ensure this is exported
    adminUpdateProductStatus,
    adminDeleteProduct,
    adminGetAllUsers,
    adminUpdateUserRole,
    adminDeleteUser,
};

