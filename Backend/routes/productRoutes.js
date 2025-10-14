// /Backend/routes/productRoutes.js
// This file now correctly imports and uses the 'authorize' middleware.

import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
} from '../controllers/productController.js';
import { protect, authorize, admin } from '../middleware/authMiddleware.js'; // Import authorize

router.route('/').get(getProducts).post(protect, authorize('seller', 'admin'), createProduct);
router.get('/top', getTopProducts);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);
router.route('/:id/reviews').post(protect, authorize('customer'), createProductReview);

export default router;

