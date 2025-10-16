const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// Customer/Seller/Admin routes
router.route('/profile').get(protect, getUserProfile);
router.route('/wishlist').get(protect, getWishlist).post(protect, addToWishlist);
router.route('/wishlist/:productId').delete(protect, removeFromWishlist);

// Admin routes
router.route('/').get(protect, admin, getUsers);
router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
