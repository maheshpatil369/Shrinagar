// shringar-backend/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductViews,
  updateProductClicks
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Public Routes ---
router.route('/').get(getProducts);
router.route('/:id').get(getProductById);
router.route('/:id/view').post(updateProductViews);
router.route('/:id/click').post(updateProductClicks);


// --- Protected Seller/Admin Routes ---
router.route('/').post(protect, authorize('seller', 'admin'), createProduct);
router.route('/:id').put(protect, authorize('seller', 'admin'), updateProduct);

// --- Protected Admin-Only Routes ---
router.route('/:id').delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
