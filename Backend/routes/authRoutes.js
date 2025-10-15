const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginUser);

// @desc    Verify an existing token
// @route   POST /api/auth/verify-token
// @access  Private (requires a valid token)
router.post('/verify-token', protect, verifyToken);


// The problematic GET route that was causing the crash has been removed.
// If you intended to have a GET route here, for example to get a user profile,
// it should be defined correctly like this:
// router.get('/profile', protect, getUserProfile); 
// And getUserProfile would need to be imported from your userController.


module.exports = router;
