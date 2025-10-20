// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/models/sellerModel.js
const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
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
    verificationDocuments: {
      gstCertificate: { type: String, required: [true, 'GST Certificate is required.'] },
      panCard: { type: String, required: [true, 'PAN Card is required.'] },
    },
  },
  {
    timestamps: true,
  }
);

// Add an index on the status field to speed up queries for pending sellers
sellerSchema.index({ status: 1 });


const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
