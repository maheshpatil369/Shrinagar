// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getAllProductsForAdmin,
  trackAffiliateClick,
} = require('../controllers/productController.js');
const { protect, authorize, admin } = require('../middleware/authMiddleware.js');

// Public route to get all approved products (with search and filtering)
router.route('/').get(getProducts);

// Admin route to get ALL products
router.route('/all').get(protect, admin, getAllProductsForAdmin);

// Seller route to create a new product
router.route('/').post(protect, authorize('seller'), createProduct);

// Seller route to get their own products
router.route('/myproducts').get(protect, authorize('seller'), getMyProducts);

// Public route to get a single product and track view.
// The controller itself contains logic to differentiate public vs authenticated access.
router.route('/:id').get(getProductById);

// Public route to track affiliate link clicks
router.route('/:id/track-click').post(trackAffiliateClick);

// Seller/Admin routes to update or delete a product
router.route('/:id')
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;

