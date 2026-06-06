const cron = require('node-cron');
const User = require('../modules/user/user.model');
const logger = require('../config/logger');
const { getRedis } = require('../config/redis');

/**
 * Runs at midnight IST (18:30 UTC) every day.
 * 1. Resets the daily question counter for all free-tier users.
 * 2. Downgrades expired Pro subscriptions back to free.
 */
const dailyResetJob = cron.schedule('30 18 * * *', async () => {
  logger.info('[CRON] Running nightly maintenance tasks...');
  try {
    // ── Task 1: Reset daily question count for free users ──────────────────
    const resetResult = await User.updateMany(
      { 'subscription.plan': 'free' },
      {
        $set: {
          'dailyUsage.questionsToday': 0,
          'dailyUsage.resetAt': new Date(),
        }
      }
    );
    logger.info(`[CRON] Reset ${resetResult.modifiedCount} users' daily question counts.`);

    // ── Also flush Redis daily question counters ────────────────────────────
    try {
      const redis = getRedis();
      const keys = await redis.keys('daily_q:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`[CRON] Flushed ${keys.length} Redis daily_q counters.`);
      }
    } catch (redisErr) {
      // Non-fatal — Redis flush failure doesn't break the job
      logger.warn('[CRON] Redis flush failed:', redisErr.message);
    }

    // ── Task 2: Downgrade expired Pro subscriptions ─────────────────────────
    const expireResult = await User.updateMany(
      {
        'subscription.plan': 'pro',
        'subscription.expiresAt': { $lt: new Date() },
      },
      {
        $set: {
          'subscription.plan': 'free',
          'subscription.status': 'expired',
        }
      }
    );
    if (expireResult.modifiedCount > 0) {
      logger.info(`[CRON] Downgraded ${expireResult.modifiedCount} expired Pro subscriptions to free.`);
    }
  } catch (err) {
    logger.error('[CRON] Nightly maintenance failed:', err);
  }
}, {
  scheduled: false, // Started manually from server.js
  timezone: 'Asia/Kolkata'
});

module.exports = dailyResetJob;
