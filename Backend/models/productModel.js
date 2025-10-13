// Backend/models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    // Reference to the seller who owns this product
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
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
      enum: ['ring', 'necklace', 'earrings', 'bracelet', 'other'],
    },
    material: {
      type: String,
      required: [true, 'Product material is required'],
    },
    images: [
      {
        type: String, // URLs to the images
        required: true,
      },
    ],
    // URL for the 3D model for AR Try-On
    arModelUrl: {
        type: String,
    },
    affiliateUrl: {
      type: String,
      required: [true, 'Affiliate URL is required'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  }
);

// Create an index on name and description for text search capabilities
productSchema.index({ name: 'text', description: 'text', material: 'text' });


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
