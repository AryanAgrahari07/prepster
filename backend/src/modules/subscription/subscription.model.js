const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startedAt: { type: Date },
    expiresAt: { type: Date },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amountPaid: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
