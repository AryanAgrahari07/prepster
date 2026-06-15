const mongoose = require('mongoose');

const guesstimateSolutionStepSchema = new mongoose.Schema({
  step: { type: String, required: true },         // e.g. "1. Define the scope"
  explanation: { type: String, required: true },  // detailed narrative for this step
  value: { type: String },                         // e.g. "~1.4 billion people in India"
}, { _id: false });

const guesstimatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['market-sizing', 'fermi', 'supply-demand', 'revenue', 'other'],
    default: 'market-sizing',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  question: {
    type: String,
    required: true, // e.g. "Estimate the number of cars sold in India per year."
  },
  hint: {
    type: String, // Optional hint to guide thinking
  },
  approach: {
    type: String,
    enum: ['top-down', 'bottom-up', 'comparative'],
    default: 'top-down',
  },
  solutionSteps: [guesstimateSolutionStepSchema],
  finalAnswer: {
    type: String,   // e.g. "~3–4 million cars"
  },
  keyAssumptions: [{ type: String }],
  isFree: {
    type: Boolean,
    default: false,
    description: 'If false, full solution requires Pro subscription',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
},
{ timestamps: true });

guesstimatSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Guesstimate', guesstimatSchema, 'mbaGuesstimates');
