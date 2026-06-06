const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Subscription = require('./subscription.model');
const User = require('../user/user.model');
const { authenticate } = require('../../middleware/auth');
const { AppError } = require('../../middleware/errorHandler');

// Initialize Razorpay conditionally so app doesn't crash if keys are missing
let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// GET /v1/subscriptions/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id }).lean();
    res.json({ success: true, data: { subscription: subscription || { plan: 'free' } } });
  } catch (err) { next(err); }
});

// POST /v1/subscriptions/create-order
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { planId } = req.body;
    let amount = 0;
    
    if (planId === 'pro_monthly') amount = 299 * 100; // in paise
    else if (planId === 'pro_annual') amount = 799 * 100;
    else throw new AppError('Invalid plan ID', 400, 4000);

    // If no razorpay keys, mock the order creation (useful for dev)
    if (!razorpayInstance) {
      console.warn("MOCK PAYMENT: Razorpay keys missing. Returning mock order ID.");
      return res.json({ 
        success: true, 
        data: { 
          orderId: `mock_order_${Date.now()}`,
          amount,
          currency: 'INR'
        } 
      });
    }

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${req.user._id}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency } });
  } catch (err) { next(err); }
});

// POST /v1/subscriptions/verify
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    // Verify signature only if Razorpay is configured and this isn't a mock order
    if (razorpayInstance && !razorpay_order_id.startsWith('mock_order_')) {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new AppError('Invalid payment signature', 400, 4000);
      }
    }

    // Determine expiry date
    let expiresAt = new Date();
    if (planId === 'pro_monthly') expiresAt.setMonth(expiresAt.getMonth() + 1);
    else if (planId === 'pro_annual') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    // Update or create subscription record
    await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      {
        plan: 'pro',
        status: 'active',
        startedAt: new Date(),
        expiresAt,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { upsert: true, new: true }
    );

    // Update user model as well for quick access in auth middleware
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      'subscription.plan': 'pro',
      'subscription.status': 'active',
      'subscription.expiresAt': expiresAt,
    }, { new: true });

    // Send Pro activation email (fire-and-forget)
    const emailService = require('../notifications/email.service');
    emailService.sendProActivationEmail(updatedUser, planId, expiresAt).catch(err =>
      console.error('[email] Pro activation email failed:', err.message)
    );

    res.json({ success: true, message: 'Payment successful, Pro activated!' });
  } catch (err) { next(err); }
});

// POST /v1/subscriptions/cancel
// Cancels auto-renewal; access remains active until expiresAt
router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user._id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: { code: 4004, message: 'No active subscription found to cancel.' }
      });
    }

    // Mirror status on user model
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'cancelled',
    });

    res.json({
      success: true,
      message: `Subscription cancelled. Your Pro access continues until ${subscription.expiresAt?.toDateString()}.`,
      data: { expiresAt: subscription.expiresAt }
    });
  } catch (err) { next(err); }
});

module.exports = router;
