// Backend/models/productModel.js
const mongoose = require('mongoose');

// --- NEW: Schema for individual reviews ---
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      // Store user's name to avoid extra population
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// --- End of new schema ---

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    // Reference to the user who is the seller
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['ring', 'necklace', 'earrings', 'bracelet', 'watch', 'other'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
    },
    material: {
      type: String,
      required: [true, 'Product material is required'],
    },
    images: [
      {
        type: String, // URLs or Base64 data URIs to the images
        required: true,
      },
    ],
    affiliateUrl: {
      type: String,
      required: [true, 'Affiliate URL is required'],
    },
    // Product status, to be approved by an admin
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    // Fields for tracking views and clicks for analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    // --- NEW: Fields for ratings and reviews ---
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    // --- End of new fields ---
  },
  {
    timestamps: true,
  }
);

// Create an index on name and description for text search capabilities
productSchema.index({ name: 'text', description: 'text', material: 'text' });

// Add an index on the status field to speed up queries for pending products
productSchema.index({ status: 1 });


const Product = mongoose.model('Product', productSchema);

module.exports = Product;