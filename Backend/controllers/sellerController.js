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
  } = req.body;

  const userId = req.user._id;

  const sellerExists = await Seller.findOne({ user: userId });

  if (sellerExists) {
    res.status(400);
    throw new Error('User is already a seller');
  }
  
  // Create and save the new seller profile
  const seller = await Seller.create({
    user: userId,
    businessName,
    gstNumber,
    panNumber,
    address,
  });
  
  // Link the seller profile to the user document
  await User.findByIdAndUpdate(userId, { sellerProfile: seller._id, role: 'seller' });

  res.status(201).json(seller);
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
    res.json(seller);
});


// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Private/Admin
exports.getSellers = asyncHandler(async (req, res) => {
  // Populate the user field to get owner's name and email
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

  if (!seller) {
    res.status(404);
    throw new Error('Seller not found');
  }

  seller.status = status;
  
  // If a seller is approved, their user role should be 'seller'
  // If they are suspended or rejected, we can revert them to 'customer'
  const newRole = status === 'approved' ? 'seller' : 'customer';
  await User.findByIdAndUpdate(seller.user, { role: newRole });

  const updatedSeller = await seller.save();
  res.json(updatedSeller);
});
