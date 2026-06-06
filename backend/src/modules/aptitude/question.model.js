const mongoose = require('mongoose');
const { TOPICS, DIFFICULTY } = require('../../shared/constants');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: [true, 'Question text is required'] },
    options: [
      {
        label: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
        text: { type: String, required: true },
      },
    ],
    correctOption: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    explanation: { type: String, required: [true, 'Explanation is required'] },
    topic: {
      type: String,
      enum: Object.values(TOPICS),
      required: true,
      index: true,
    },
    subTopic: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY),
      required: true,
      index: true,
    },
    companies: [{ type: String, index: true }], // Tags for companies (e.g., 'TCS', 'Infosys')
    tags: [{ type: String, index: true }], // Other topic tags (e.g., 'time-speed-distance')
    source: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    stats: {
      totalAttempts: { type: Number, default: 0 },
      correctAttempts: { type: Number, default: 0 },
      avgTimeSeconds: { type: Number, default: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
