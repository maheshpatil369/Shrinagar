import asyncHandler from 'express-async-handler';
import Seller from '../models/sellerModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// @desc    Enroll a user as a seller
// @route   POST /api/sellers/enroll
// @access  Private
export const enrollSeller = asyncHandler(async (req, res) => {
  const { businessName, address, phone } = req.body;
  const userId = req.user._id;

  const sellerExists = await Seller.findOne({ user: userId });

  if (sellerExists) {
    res.status(400);
    throw new Error('User is already a seller');
  }

  const seller = await Seller.create({
    user: userId,
    businessName,
    address,
    phone,
  });

  if (seller) {
    // Update the user model to reflect seller status
    await User.findByIdAndUpdate(userId, { isSeller: true });
    res.status(201).json({
      _id: seller._id,
      user: seller.user,
      businessName: seller.businessName,
      status: seller.status,
    });
  } else {
    res.status(400);
    throw new Error('Invalid seller data');
  }
});

// @desc    Get seller profile
// @route   GET /api/sellers/profile
// @access  Private (Seller only)
export const getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id }).populate('user', 'name email');
  if (seller) {
    res.json(seller);
  } else {
    res.status(404);
    throw new Error('Seller profile not found');
  }
});

// @desc    Update seller profile
// @route   PUT /api/sellers/profile
// @access  Private (Seller only)
export const updateSellerProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id });

  if (seller) {
    seller.businessName = req.body.businessName || seller.businessName;
    seller.address = req.body.address || seller.address;
    seller.phone = req.body.phone || seller.phone;

    const updatedSeller = await seller.save();
    res.json(updatedSeller);
  } else {
    res.status(404);
    throw new Error('Seller profile not found');
  }
});

// @desc    Get all products for a specific seller
// @route   GET /api/sellers/products
// @access  Private (Seller only)
export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
});
