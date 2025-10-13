// shringar-backend/routes/sellerRoutes.js

const express = require('express');
const router = express.Router();
const {
  enrollSeller,
  getSellers,
  getSellerById,
  updateSellerStatus,
  getSellerDashboard,
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Protected Routes ---

// Route for a registered user to enroll as a seller
router.route('/enroll').post(protect, enrollSeller);

// Route for a seller to get their dashboard info
router.route('/dashboard').get(protect, authorize('seller', 'admin'), getSellerDashboard);


// --- Admin-Only Routes ---
router.route('/').get(protect, authorize('admin'), getSellers);
router.route('/:id').get(protect, authorize('admin'), getSellerById);
router.route('/:id/status').put(protect, authorize('admin'), updateSellerStatus);

module.exports = router;
