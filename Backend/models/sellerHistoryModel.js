// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Backend/models/sellerHistoryModel.js
const mongoose = require('mongoose');

const changeSchema = new mongoose.Schema({
  field: { type: String, required: true },
  oldValue: { type: String },
  newValue: { type: String },
}, { _id: false });

const sellerHistorySchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changes: [changeSchema],
    notes: {
      type: String, // Optional notes, e.g., 'Approved by admin'
    }
  },
  {
    timestamps: true,
  }
);

const SellerHistory = mongoose.model('SellerHistory', sellerHistorySchema);

module.exports = SellerHistory;
