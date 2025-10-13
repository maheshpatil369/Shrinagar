// Backend/routes/productRoutes.js
import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPendingProducts,
  approveProduct,
} from '../controllers/productController.js';
import { validateProduct } from '../middleware/validationMiddleware.js';
// Import the new 'authorize' function instead of 'admin' and 'seller'
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, authorize('seller'), validateProduct, createProduct);

router.route('/pending').get(protect, authorize('admin'), getPendingProducts);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('seller'), validateProduct, updateProduct)
  .delete(protect, authorize('seller'), deleteProduct);

router.route('/:id/approve').put(protect, authorize('admin'), approveProduct);

export default router;

