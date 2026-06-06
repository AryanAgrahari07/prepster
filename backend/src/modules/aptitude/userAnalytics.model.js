const mongoose = require('mongoose');

const userAnalyticsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    totalQuestionsAttempted: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    topicStats: {
      quantitative: { attempted: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, avgTime: { type: Number, default: 0 } },
      logical:      { attempted: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, avgTime: { type: Number, default: 0 } },
      verbal:       { attempted: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, avgTime: { type: Number, default: 0 } },
      di:           { attempted: { type: Number, default: 0 }, correct: { type: Number, default: 0 }, avgTime: { type: Number, default: 0 } },
    },
    subTopicAccuracy: { type: Map, of: { attempted: Number, correct: Number }, default: {} },
    weakAreas: [{ type: String }],
    strongAreas: [{ type: String }],
    dailyActivity: [{
      date: Date,
      questionsAttempted: Number,
      accuracy: Number,
    }],
    companyReadiness: { type: Map, of: Number, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

userAnalyticsSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);
