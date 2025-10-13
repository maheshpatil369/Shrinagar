// Backend/models/sellerModel.js
import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    businessName: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
      required: true,
      unique: true,
    },
    panNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String, default: 'India' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Seller = mongoose.model('Seller', sellerSchema);

// Use 'export default' instead of 'module.exports'
export default Seller;
