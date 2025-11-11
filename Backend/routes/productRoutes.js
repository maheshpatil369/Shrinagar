// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getTrendingProducts, // Added for the new homepage
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  trackAffiliateClick,
  createProductReview, // --- Add new controller ---
} = require('../controllers/productController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

// --- Public Routes ---
router.route('/').get(getProducts);
router.route('/trending').get(getTrendingProducts); // New route for the homepage
router.route('/:id').get(getProductById);
router.route('/:id/track-click').post(trackAffiliateClick);

// --- Seller Routes (Protected) ---
router.route('/').post(protect, authorize('seller'), createProduct);
router.route('/myproducts').get(protect, authorize('seller'), getMyProducts);
router
  .route('/:id')
  .put(protect, authorize('seller'), updateProduct)
  .delete(protect, authorize('seller'), deleteProduct);

// --- NEW: Customer Review Route (Protected) ---
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;