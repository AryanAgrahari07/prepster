const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Subscription = require('./subscription.model');
const User = require('../user/user.model');
const emailService = require('../notifications/email.service');
const logger = require('../../config/logger');

// Razorpay Webhook endpoint
router.post('/razorpay', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    // ── Verify webhook signature if secret is configured ──
    if (secret) {
      const sig = req.headers['x-razorpay-signature'];
      if (!req.rawBody) {
        logger.error('Raw body missing for Razorpay signature verification');
        return res.status(400).json({ error: 'Webhook configuration error' });
      }
      const expected = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
      if (sig !== expected) {
        logger.warn('Invalid Razorpay webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body;
    const { event: eventType, payload } = event;
    logger.info(`[Webhook] Razorpay event: ${eventType}`);

    // ── payment.captured ─────────────────────────────────────────────────────
    if (eventType === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.order_id;
      await Subscription.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { status: 'active', razorpayPaymentId: paymentId }
      );
    }

    // ── payment.failed ────────────────────────────────────────────────────────
    if (eventType === 'payment.failed') {
      const orderId = payload.payment?.entity?.order_id;
      if (orderId) {
        const sub = await Subscription.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { status: 'payment-failed' },
          { new: true }
        );
        if (sub) {
          // Mirror status on user model
          await User.findByIdAndUpdate(sub.userId, {
            'subscription.status': 'payment-failed',
          });
          // Send payment failure email (fire-and-forget)
          const user = await User.findById(sub.userId).select('email profile').lean();
          if (user) {
            emailService.sendPaymentFailedEmail(user).catch(err =>
              logger.error('[email] Payment failed email error:', err.message)
            );
          }
        }
      }
    }

    // ── subscription.charged (auto-renewal successful) ────────────────────────
    if (eventType === 'subscription.charged') {
      const razorpaySubId = payload.subscription?.entity?.id;
      if (razorpaySubId) {
        const sub = await Subscription.findOne({
          $or: [
            { 'razorpay.subscriptionId': razorpaySubId },
            { razorpaySubscriptionId: razorpaySubId },
          ],
        });
        if (sub) {
          const newExpiry = new Date();
          if (sub.plan === 'pro-monthly' || sub.plan === 'pro') {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
          } else {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
          }
          sub.expiresAt = newExpiry;
          sub.status = 'active';
          await sub.save();

          await User.findByIdAndUpdate(sub.userId, {
            'subscription.status': 'active',
            'subscription.expiresAt': newExpiry,
            'subscription.plan': 'pro',
          });
          logger.info(`[Webhook] Renewed subscription for user ${sub.userId} until ${newExpiry}`);
        }
      }
    }

    // ── subscription.cancelled ────────────────────────────────────────────────
    if (eventType === 'subscription.cancelled') {
      const subId = payload.subscription?.entity?.id;
      const sub = await Subscription.findOneAndUpdate(
        { razorpayOrderId: subId },
        { status: 'cancelled' },
        { new: true }
      );
      if (sub) {
        await User.findByIdAndUpdate(sub.userId, { 'subscription.status': 'cancelled' });
      }
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('[Webhook] Processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
