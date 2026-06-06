const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  maxUses: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: is coupon valid right now?
couponSchema.virtual('isValid').get(function () {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.maxUses !== null && this.usedCount >= this.maxUses) return false;
  return true;
});

module.exports = mongoose.model('Coupon', couponSchema);
