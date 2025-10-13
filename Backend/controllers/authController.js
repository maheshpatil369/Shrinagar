// Backend/controllers/authController.js
import User from '../models/userModel.js';
import Seller from '../models/sellerModel.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new seller
// @route   POST /api/auth/register-seller
// @access  Public
const registerSeller = asyncHandler(async (req, res) => {
  const { name, email, password, businessName, gstNumber, panNumber, address } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const sellerProfile = await Seller.create({
    businessName,
    gstNumber,
    panNumber,
    address,
  });

  if (!sellerProfile) {
    res.status(400);
    throw new Error('Invalid seller data');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'seller',
    sellerProfile: sellerProfile._id,
  });

  if (user) {
    sellerProfile.user = user._id;
    await sellerProfile.save();
    
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    // If user creation fails, we should ideally remove the created seller profile
    await Seller.findByIdAndDelete(sellerProfile._id);
    res.status(400);
    throw new Error('Invalid user data');
  }
});


export { registerUser, loginUser, registerSeller };
