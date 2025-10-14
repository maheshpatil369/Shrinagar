// shringar-backend/controllers/sellerController.js

const Seller = require('../models/sellerModel');
const User = require('../models/userModel');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Enroll a new seller
// @route   POST /api/sellers/enroll
// @access  Private (for registered users)
exports.enrollSeller = asyncHandler(async (req, res) => {
  const {
    businessName,
    gstNumber,
    panNumber,
    address,
    bankDetails,
  } = req.body;

  const userId = req.user._id; // Get user ID from protect middleware

  // Check if the user is already a seller
  const sellerExists = await Seller.findOne({ user: userId });

  if (sellerExists) {
    res.status(400);
    throw new Error('User is already a seller');
  }

  const seller = new Seller({
    user: userId,
    businessName,
    gstNumber,
    panNumber,
    address,
    bankDetails,
  });

  const createdSeller = await seller.save();

  // IMPORTANT: We do NOT update the user's role to 'seller' immediately.
  // This should only happen when an admin approves the application.
  
  res.status(201).json(createdSeller);
});

// @desc    Get current seller's dashboard data
// @route   GET /api/sellers/dashboard
// @access  Private/Seller
exports.getSellerDashboard = asyncHandler(async (req, res) => {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
        res.status(404);
        throw new Error('Seller profile not found');
    }
    // In a real app, you would aggregate product views, clicks, sales, etc.
    // For now, we'll send back the seller profile.
    res.json(seller);
});


// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Private/Admin
exports.getSellers = asyncHandler(async (req, res) => {
  const sellers = await Seller.find({}).populate('user', 'name email');
  res.json(sellers);
});

// @desc    Get seller by ID
// @route   GET /api/sellers/:id
// @access  Private/Admin
exports.getSellerById = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.params.id).populate('user', 'name email');
  if (seller) {
    res.json(seller);
  } else {
    res.status(404);
    throw new Error('Seller not found');
  }
});

// @desc    Update seller status (approve, suspend, reject)
// @route   PUT /api/sellers/:id/status
// @access  Private/Admin
exports.updateSellerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const seller = await Seller.findById(req.params.id);

  if (seller) {
    seller.status = status;
    const updatedSeller = await seller.save();

    // Also update the user's role if they are approved
    if (status === 'active') {
        await User.findByIdAndUpdate(seller.user, { role: 'seller' });
    }
    
    res.json(updatedSeller);
  } else {
    res.status(404);
    throw new Error('Seller not found');
  }
});
