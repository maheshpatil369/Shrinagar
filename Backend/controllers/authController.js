// maheshpatil369/shrinagar/Shrinagar-fec0a47de051ffa389da59e3900a2428b5397e43/Backend/controllers/authController.js
const asyncHandler = require('../middleware/asyncHandler.js');
const User = require('../models/userModel.js');
// Import the centralized token generation utility
const generateToken = require('../utils/generateToken.js');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body; // Accept role from request

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Use the provided role, or default to 'customer'
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'customer',
  });

  if (user) {
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
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
  
  // Find user by email and explicitly select the password field for comparison
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
     const token = generateToken(user._id, user.role);
     res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Verify user token
// @route   GET /api/auth/verify-token
// @access  Private
const verifyToken = asyncHandler(async (req, res) => {
  // If the protect middleware was successful, req.user will be populated.
  // We can just return the user data.
  res.status(200).json(req.user);
});


module.exports = { registerUser, loginUser, verifyToken };
