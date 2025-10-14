// /Backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require('../controllers/productController.js');
const { protect, authorize } = require('../middleware/authMiddleware.js');

// Public route to get all approved products
router.route('/').get(getProducts);

// Seller route to create a new product
router.route('/').post(protect, authorize('seller'), createProduct);

// Seller route to get their own products
router.route('/myproducts').get(protect, authorize('seller'), getMyProducts);

// Public route to get a single product
// Controller logic will handle authorization for non-approved products
router.route('/:id').get(protect, getProductById); 

// Seller/Admin routes to update or delete a product
router.route('/:id')
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

module.exports = router;
