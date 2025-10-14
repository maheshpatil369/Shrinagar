// /Backend/routes/userRoutes.js
// The user registration route is removed from here as it's now handled by authRoutes.

import express from 'express';
const router = express.Router();
import {
  // registerUser, // No longer needed here
  getUsers,
  getUserByID,
  deleteUser,
  updateUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// The POST route for registration is removed from this chain.
router.route('/').get(protect, admin, getUsers);

router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserByID)
  .put(protect, admin, updateUser);

export default router;
