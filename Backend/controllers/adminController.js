// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Backend/controllers/adminController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const User = require('../models/userModel.js');
const Product = require('../models/productModel.js');
const Seller = require('../models/sellerModel.js');
const Notification = require('../models/notificationModel.js');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments({});
    
    const pendingSellers = await Seller.countDocuments({ status: 'pending' });
    const pendingProducts = await Product.countDocuments({ status: 'pending' });

    res.json({
        totalUsers,
        totalSellers,
        totalProducts,
        pendingApprovals: pendingSellers + pendingProducts,
    });
});

// @desc    Get all sellers for admin
// @route   GET /api/admin/sellers
// @access  Private/Admin
const adminGetAllSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find({}).populate('user', 'name email');
  res.json(sellers);
});

// @desc    Get seller by ID for admin
// @route   GET /api/admin/sellers/:id
// @access  Private/Admin
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
// @route   PUT /api/admin/sellers/:id/status
// @access  Private/Admin
const adminUpdateSellerStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
        res.status(404);
        throw new Error('Seller not found');
    }

    seller.status = status;
    
    const newRole = status === 'approved' ? 'seller' : 'customer';
    await User.findByIdAndUpdate(seller.user, { role: newRole });

    await Notification.create({
        user: seller.user,
        message: `Your seller account has been ${status}.`,
        link: '/seller?tab=profile',
    });

    const updatedSeller = await seller.save();
    res.json(updatedSeller);
});

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const adminGetAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).populate('seller', 'name');
    res.json(products);
});

// @desc    Update product status
// @route   PUT /api/admin/products/:id/status
// @access  Private/Admin
const adminUpdateProductStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        product.status = status;
        const updatedProduct = await product.save();

        await Notification.create({
            user: product.seller,
            message: `Your product "${product.name}" has been ${status}.`,
            link: '/seller?tab=products',
        });
        
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product by admin
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
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

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
const adminGetAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } });
    res.json(users);
});

// @desc    Update user role by admin
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
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

// @desc    Delete user by admin
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const adminDeleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        await User.deleteOne({ _id: user._id });
        // Also delete seller profile if it exists
        if (user.sellerProfile) {
            await Seller.deleteOne({ _id: user.sellerProfile });
        }
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


module.exports = {
    getDashboardStats,
    adminGetAllSellers,
    adminGetSellerById,
    adminUpdateSellerStatus,
    adminGetAllProducts,
    adminUpdateProductStatus,
    adminDeleteProduct,
    adminGetAllUsers,
    adminUpdateUserRole,
    adminDeleteUser,
};

