// Backend/models/sellerModel.js
const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    // Reference to the main User model for login credentials
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please provide a business name'],
      unique: true,
    },
    gstNumber: {
      type: String,
      required: [true, 'Please provide your GST number'],
      unique: true,
    },
    panNumber: {
      type: String,
      required: [true, 'Please provide your PAN number'],
      unique: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    // Status of the seller's application and account
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended', 'rejected'],
      default: 'pending',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // Additional fields for verification and dashboard
    verificationDocuments: {
        gstCertificate: { type: String }, // URL to the uploaded file
        panCard: { type: String },       // URL to the uploaded file
    },
  },
  {
    timestamps: true,
  }
);

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
