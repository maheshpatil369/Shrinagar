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
// Import the new 'authorize' function instead of 'admin'
import { protect, authorize } from '../middleware/authMiddleware.js';

// Routes for the logged-in user's profile
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Routes for admin-only user management
// Use authorize('admin') instead of the old 'admin' middleware
router.route('/').get(protect, authorize('admin'), getUsers);

router
  .route('/:id')
  .delete(protect, authorize('admin'), deleteUser)
  .get(protect, authorize('admin'), getUserById)
  .put(protect, authorize('admin'), updateUser);

export default router;

