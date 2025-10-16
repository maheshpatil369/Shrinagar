// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Backend/controllers/sellerController.js
const Seller = require('../models/sellerModel');
const User = require('../models/userModel');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Enroll or Update a seller profile
// @route   POST /api/sellers/enroll
// @access  Private (for registered users with 'seller' role)
exports.enrollSeller = asyncHandler(async (req, res) => {
  const {
    businessName,
    gstNumber,
    panNumber,
    address,
    verificationDocuments,
  } = req.body;

  const userId = req.user._id;

  // Check if a seller profile already exists for this user
  let seller = await Seller.findOne({ user: userId });

  if (seller) {
    // If it exists, update it
    seller.businessName = businessName || seller.businessName;
    seller.gstNumber = gstNumber || seller.gstNumber;
    seller.panNumber = panNumber || seller.panNumber;
    seller.address = address || seller.address;
    seller.verificationDocuments = verificationDocuments || seller.verificationDocuments;
    // When a seller updates their profile, it should go back to pending for re-verification
    seller.status = 'pending'; 

    const updatedSeller = await seller.save();
    res.status(200).json(updatedSeller);

  } else {
    // If it doesn't exist, create a new one
    seller = await Seller.create({
      user: userId,
      businessName,
      gstNumber,
      panNumber,
      address,
      verificationDocuments,
    });
    
    // Link the seller profile to the user document
    await User.findByIdAndUpdate(userId, { sellerProfile: seller._id });

    res.status(201).json(seller);
  }
});


// @desc    Get current seller's dashboard data
// @route   GET /api/sellers/dashboard
// @access  Private/Seller
exports.getSellerDashboard = asyncHandler(async (req, res) => {
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
        // Return 404 but don't throw an error, as it's a valid state for a new seller
        return res.status(404).json({ message: 'Seller profile not found. Please complete enrollment.' });
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
  // Note: We keep the role as 'seller' so they can access the seller dashboard to fix their profile
  // const newRole = status === 'approved' ? 'seller' : 'customer';
  // await User.findByIdAndUpdate(seller.user, { role: newRole });

  const updatedSeller = await seller.save();
  res.json(updatedSeller);
});
