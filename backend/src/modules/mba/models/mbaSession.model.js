const mongoose = require('mongoose');

const mbaSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionType: {
    type: String,
    enum: ['gd', 'pi', 'case', 'wat'],
    required: true,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
  },
  
  // Depending on sessionType, one of these will be populated
  gdTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'GdTopic' },
  piQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PiQuestion' },
  caseStudyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseStudy' },
  watTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'WatTopic' },

  // User submissions or notes for self-evaluation
  submission: {
    type: String,
    description: 'The user\'s essay for WAT, or notes for GD/Case',
  },
  selfRating: {
    type: Number,
    min: 1,
    max: 5,
    description: 'Self-evaluation score',
  },
  timeTakenSeconds: {
    type: Number,
  },

  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

mbaSessionSchema.index({ userId: 1, sessionType: 1, startedAt: -1 });

module.exports = mongoose.model('MbaSession', mbaSessionSchema);
