const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  sector: {
    type: String,
    required: true, // e.g., 'FMCG', 'Tech', 'Healthcare', 'Finance'
  },
  type: {
    type: String,
    enum: ['profitability', 'market-entry', 'pricing', 'm-and-a', 'growth', 'unconventional'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  description: {
    type: String,
    required: true,
    description: 'The prompt or the initial situation given to the candidate',
  },
  structuredApproach: [{
    step: String,
    details: String,
  }],
  solution: {
    type: String,
    description: 'The final proposed solution or synthesis',
  },
  isFree: {
    type: Boolean,
    default: false,
    description: 'If false, requires Pro subscription to view the solution',
  },
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

caseStudySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CaseStudy', caseStudySchema);
