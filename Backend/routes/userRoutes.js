// Backend/routes/userRoutes.js
import express from 'express';
const router = express.Router();
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Note: The most specific routes should come first.
// Routes for the logged-in user's profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Routes for admin-only user management
router.route('/').get(protect, admin, getUsers); // Changed authorize('admin') to admin

router
  .route('/:id')
  .delete(protect, admin, deleteUser) // Changed authorize('admin') to admin
  .get(protect, admin, getUserById)   // Changed authorize('admin') to admin
  .put(protect, admin, updateUser);    // Changed authorize('admin') to admin

export default router;
