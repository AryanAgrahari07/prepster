require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();


  const server = app.listen(PORT, () => {
    logger.info(`🚀 Prepster API running on port ${PORT} [${process.env.NODE_ENV}]`);
    logger.info(`📡 Health check: http://localhost:${PORT}/health`);

    // ─── Start Cron Jobs ───────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'test') {
      const dailyResetJob = require('./jobs/dailyReset');
      dailyResetJob.start();
      logger.info('⏰ Daily reset cron job started (midnight IST)');

      const reminderEmailJob = require('./jobs/reminderEmail');
      reminderEmailJob.start();
      logger.info('📧 Renewal reminder cron job started (10:00 IST daily)');

      const jobAlertCron = require('./jobs/jobAlertCron');
      jobAlertCron.start();
      logger.info('💼 Job alert cron job started (09:00 IST daily)');

      const scrapeJobsCron = require('./jobs/scrapeJobsCron');
      scrapeJobsCron.start();
      logger.info('🌐 Job scraper cron started (01:00 IST daily)');

      // Prevent Render from sleeping
      const pingerJob = require('./jobs/pingerJob');
      pingerJob.start();
      logger.info('⚡ Keep-awake pinger started (every 14 mins)');
    }
  });

  // ─── Graceful Shutdown ───────────────────────────────────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });

    // Force exit after 10s if server didn't close
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
  });
};

startServer();
