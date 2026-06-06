const cron = require('node-cron');
const User = require('../modules/user/user.model');
const emailService = require('../modules/notifications/email.service');
const logger = require('../config/logger');

/**
 * Runs daily at 10:00 IST (04:30 UTC).
 * Finds Pro subscribers whose subscription expires in exactly 7 days
 * and sends them a renewal reminder email.
 */
const reminderEmailJob = cron.schedule('30 4 * * *', async () => {
  logger.info('[CRON] Running subscription renewal reminder job...');
  try {
    const now = new Date();
    // Find users with expiresAt between 6.5 and 7.5 days from now
    const windowStart = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000);

    const usersToRemind = await User.find({
      'subscription.plan': 'pro',
      'subscription.status': 'active',
      'subscription.expiresAt': { $gte: windowStart, $lte: windowEnd },
      isDeleted: false,
    }).select('email profile subscription').lean();

    if (usersToRemind.length === 0) {
      logger.info('[CRON] No renewal reminders to send today.');
      return;
    }

    logger.info(`[CRON] Sending renewal reminders to ${usersToRemind.length} users...`);

    let sent = 0;
    for (const user of usersToRemind) {
      try {
        const expiresAt = new Date(user.subscription.expiresAt);
        const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        const firstName = user.profile?.firstName || 'there';

        await emailService.sendRenewalReminderEmail(user, daysLeft, expiresAt);
        sent++;
      } catch (err) {
        logger.error(`[CRON] Failed to send reminder to ${user.email}:`, err.message);
      }
    }

    logger.info(`[CRON] Sent ${sent}/${usersToRemind.length} renewal reminders.`);
  } catch (err) {
    logger.error('[CRON] Renewal reminder job failed:', err);
  }
}, {
  scheduled: false, // Started manually from server.js
  timezone: 'Asia/Kolkata',
});

module.exports = reminderEmailJob;
