const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const Coupon = require('./coupon.model');

// Fallback hardcoded coupons (used when not found in DB — keeps launch offers working without admin setup)
const FALLBACK_COUPONS = {
  'PREPSTER20': { discount: 20, type: 'percent', description: '20% off Pro subscription' },
  'LAUNCH50':   { discount: 50, type: 'percent', description: '50% off — Launch offer!' },
  'DINZ299':    { discount: 299, type: 'flat',    description: 'Flat ₹299 off — Partner discount' },
};

// POST /v1/coupons/validate
router.post('/validate', authenticate, async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: { code: 4000, message: 'Coupon code is required' } });
  }

  const normalizedCode = code.trim().toUpperCase();

  try {
    // Try DB first
    const dbCoupon = await Coupon.findOne({ code: normalizedCode });
    if (dbCoupon) {
      if (!dbCoupon.isActive) {
        return res.status(400).json({ success: false, error: { code: 4004, message: 'This coupon has been deactivated' } });
      }
      if (dbCoupon.expiresAt && new Date() > dbCoupon.expiresAt) {
        return res.status(400).json({ success: false, error: { code: 4004, message: 'This coupon has expired' } });
      }
      if (dbCoupon.maxUses !== null && dbCoupon.usedCount >= dbCoupon.maxUses) {
        return res.status(400).json({ success: false, error: { code: 4004, message: 'This coupon has reached its usage limit' } });
      }
      return res.json({
        success: true,
        data: {
          coupon: {
            code: normalizedCode,
            discount: dbCoupon.discountPercent,
            type: 'percent',
            description: dbCoupon.description || `${dbCoupon.discountPercent}% off Pro subscription`,
          },
        },
      });
    }

    // Fallback to hardcoded
    const fallback = FALLBACK_COUPONS[normalizedCode];
    if (!fallback) {
      return res.status(404).json({ success: false, error: { code: 4004, message: 'Invalid or expired coupon code' } });
    }

    res.json({ success: true, data: { coupon: { ...fallback, code: normalizedCode } } });
  } catch (err) {
    // If DB fails, try hardcoded fallback
    const fallback = FALLBACK_COUPONS[normalizedCode];
    if (fallback) {
      return res.json({ success: true, data: { coupon: { ...fallback, code: normalizedCode } } });
    }
    res.status(500).json({ success: false, error: { code: 5001, message: 'Failed to validate coupon' } });
  }
});

module.exports = router;


