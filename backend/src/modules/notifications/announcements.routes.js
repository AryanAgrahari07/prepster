const express = require('express');
const router = express.Router();
const Announcement = require('../admin/announcement.model');
const { optionalAuth } = require('../../middleware/auth');

/**
 * GET /v1/notifications/announcements
 * Returns active, non-expired platform announcements.
 * Uses optionalAuth so both logged-in and public users can get general announcements,
 * but filters by audience if user is authenticated.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const now = new Date();
    const filter = {
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    };

    // Filter by audience based on user's subscription
    if (req.user) {
      const userPlan = req.user.subscription?.plan || 'free';
      filter.audience = { $in: ['all', userPlan] };
    } else {
      // Unauthenticated users — only see 'all' announcements
      filter.audience = 'all';
    }

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title body type audience createdAt')
      .lean();

    res.json({ success: true, data: { announcements } });
  } catch (err) { next(err); }
});

module.exports = router;
