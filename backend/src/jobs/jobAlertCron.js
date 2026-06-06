const cron = require('node-cron');
const User = require('../modules/user/user.model');
const Job = require('../modules/jobs/job.model');
const emailService = require('../modules/notifications/email.service');
const logger = require('../config/logger');

/**
 * Runs daily at 09:00 IST (03:30 UTC).
 * Finds new jobs posted in the last 24 hours and matches them with
 * users whose targetCompanies include the job's company.
 * Sends a consolidated job alert email to matching users.
 */
const jobAlertCron = cron.schedule('30 3 * * *', async () => {
  logger.info('[CRON] Running job alert cron...');
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find jobs posted in the last 24 hours
    const recentJobs = await Job.find({
      createdAt: { $gte: yesterday, $lte: now },
      status: 'active'
    }).lean();

    if (recentJobs.length === 0) {
      logger.info('[CRON] No new jobs posted in the last 24 hours. Skipping alerts.');
      return;
    }

    // Get all distinct companies from recent jobs
    const recentCompanies = [...new Set(recentJobs.map(job => job.companyName))];

    // Find users who have any of these companies in their targetCompanies
    const users = await User.find({
      'profile.targetCompanies': { $in: recentCompanies },
      isDeleted: false
    }).select('email profile').lean();

    if (users.length === 0) {
      logger.info('[CRON] No users match the newly posted jobs.');
      return;
    }

    let sent = 0;
    for (const user of users) {
      try {
        // Filter jobs that match this specific user's target companies
        const matchingJobs = recentJobs.filter(job => 
          user.profile?.targetCompanies?.includes(job.companyName)
        );

        if (matchingJobs.length > 0) {
          await emailService.sendJobAlertEmail(user, matchingJobs);
          sent++;
        }
      } catch (err) {
        logger.error(`[CRON] Failed to send job alert to ${user.email}:`, err.message);
      }
    }

    logger.info(`[CRON] Sent ${sent} job alert emails.`);
  } catch (err) {
    logger.error('[CRON] Job alert cron failed:', err);
  }
}, {
  scheduled: false, // Started manually from server.js
  timezone: 'Asia/Kolkata',
});

module.exports = jobAlertCron;
