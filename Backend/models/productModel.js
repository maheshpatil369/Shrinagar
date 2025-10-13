// Backend/models/productModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String, // URL to the image
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // This field can store the URL to the AR model file
    arModelUrl: {
      type: String,
    },
    affiliateUrl: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

// Use 'export default' instead of 'module.exports'
export default Product;
