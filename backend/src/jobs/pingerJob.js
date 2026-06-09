const cron = require('node-cron');
const https = require('https');
const logger = require('../config/logger');

// Render automatically injects RENDER_EXTERNAL_URL, but we provide a fallback
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://prepster-6yut.onrender.com';
const URL = `${RENDER_URL}/health`;

/**
 * Runs every 14 minutes.
 * Makes a GET request to the backend's own /health endpoint.
 * This prevents Render's free tier from spinning down the service after 15 minutes of inactivity.
 */
const pingerJob = cron.schedule('*/14 * * * *', () => {
  logger.info(`[CRON] ⚡ Pinging ${URL} to keep backend awake...`);
  
  https.get(URL, (res) => {
    if (res.statusCode === 200) {
      logger.info(`[CRON] ⚡ Ping successful (Status 200)`);
    } else {
      logger.warn(`[CRON] ⚡ Ping returned status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    logger.error(`[CRON] ⚡ Ping failed: ${err.message}`);
  });
}, {
  scheduled: false,
});

module.exports = pingerJob;
