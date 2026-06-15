const mongoose = require('mongoose');

const mbaAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // GD
  gdSessionsCompleted: { type: Number, default: 0 },

  // PI
  piSessionsCompleted: { type: Number, default: 0 },

  // Case Studies
  caseSessionsCompleted: { type: Number, default: 0 },

  // WAT
  watSessionsCompleted: { type: Number, default: 0 },
  watAvgWordsPerSession: { type: Number, default: 0 },

  // Guesstimates
  guesstimateSolvedCount: { type: Number, default: 0 },

  // Self-rating history (average across all sessions)
  avgSelfRating: { type: Number, default: 0 },

  // Activity timeline — last 30 days (date + types practiced)
  recentActivity: [{
    date: { type: Date },
    types: [{ type: String }], // ['gd', 'pi', 'case', 'wat']
  }],

  updatedAt: { type: Date, default: Date.now },
});

mbaAnalyticsSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('MbaAnalytics', mbaAnalyticsSchema);
