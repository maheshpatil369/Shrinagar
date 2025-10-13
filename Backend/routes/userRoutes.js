// shringar-backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');


// --- Protected User Routes ---
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);


// --- Admin-Only Routes ---
router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/:id').get(protect, authorize('admin'), getUserById)
                   .put(protect, authorize('admin'), updateUser)
                   .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
