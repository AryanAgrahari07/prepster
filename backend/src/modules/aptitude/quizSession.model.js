const mongoose = require('mongoose');
const { SESSION_TYPES, SESSION_STATUS } = require('../../shared/constants');

const quizSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionType: { type: String, enum: Object.values(SESSION_TYPES), required: true },
    companySlug: { type: String, default: null },
    status: { type: String, enum: Object.values(SESSION_STATUS), default: SESSION_STATUS.IN_PROGRESS },
    questions: [{
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
      isCorrect: { type: Boolean, default: false },
      timeTakenSeconds: { type: Number, default: 0 },
      flaggedForReview: { type: Boolean, default: false },
    }],
    score: {
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      unattempted: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },
    timeLimitSeconds: { type: Number, default: null },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

quizSessionSchema.index({ userId: 1, createdAt: -1 });
quizSessionSchema.index({ sessionType: 1 });
quizSessionSchema.index({ companySlug: 1 });

module.exports = mongoose.model('QuizSession', quizSessionSchema);
