// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/models/productViewModel.js
const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  // Use user's ID if they are logged in
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Fallback to IP address for anonymous users
  ipAddress: {
    type: String,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to quickly find if a user/ip has viewed a product recently
productViewSchema.index({ productId: 1, userId: 1 });
productViewSchema.index({ productId: 1, ipAddress: 1 });

// Automatically delete view records after 24 hours to keep the collection clean
productViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 86400 }); // 86400 seconds = 24 hours

const ProductView = mongoose.model('ProductView', productViewSchema);

module.exports = ProductView;

