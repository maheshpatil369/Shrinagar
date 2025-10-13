// Backend/routes/authRoutes.js
import express from 'express';
import {
  registerUser,
  loginUser,
  registerSeller,
} from '../controllers/authController.js';
import {
  validateRegistration,
  validateLogin,
  validateSellerRegistration,
} from '../middleware/validationMiddleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', rateLimiter, validateRegistration, registerUser);
router.post('/login', rateLimiter, validateLogin, loginUser);
router.post('/register-seller', rateLimiter, validateSellerRegistration, registerSeller);

export default router;

