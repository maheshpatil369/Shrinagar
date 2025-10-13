import express from 'express';
import {
  enrollSeller,
  getSellerProfile,
  updateSellerProfile,
  getSellerProducts,
} from '../controllers/sellerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/enroll', protect, enrollSeller);

router.route('/profile')
  .get(protect, authorize('seller'), getSellerProfile)
  .put(protect, authorize('seller'), updateSellerProfile);
  
router.get('/products', protect, authorize('seller'), getSellerProducts);

export default router;
