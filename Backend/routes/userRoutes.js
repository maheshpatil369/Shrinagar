import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// User's own profile routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only routes
router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteUser);

export default router;
