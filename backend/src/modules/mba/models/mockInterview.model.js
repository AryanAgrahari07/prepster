const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  piQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PiQuestion' },
  questionText:  { type: String },                      // denormalized snapshot
  userAnswer:    { type: String, default: '' },
  selfRating:    { type: Number, min: 1, max: 5 },      // user's self-score after answering
  timeTakenSeconds: { type: Number, default: 0 },
}, { _id: false });

const mockInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Snapshot of question IDs used, drawn from PiQuestion bank
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PiQuestion' }],

  // Per-question responses
  answers: [answerSchema],

  // Session state
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
  },

  // Aggregate scores
  avgSelfRating: { type: Number },
  totalTimeTakenSeconds: { type: Number, default: 0 },

  startedAt:   { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
