const mongoose = require('mongoose');

const piQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['hr', 'behavioral', 'situational', 'technical'],
    required: true,
  },
  starFramework: {
    situation: String,
    task: String,
    action: String,
    result: String,
  },
  sampleAnswer: {
    type: String,
    description: 'A well-crafted sample response',
  },
  doNot: [{
    type: String,
    description: 'Common mistakes to avoid when answering this question',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

piQuestionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PiQuestion', piQuestionSchema, 'mbaPiQuestions');
