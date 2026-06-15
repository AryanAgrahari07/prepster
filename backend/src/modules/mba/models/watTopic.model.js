const mongoose = require('mongoose');

const watTopicSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true,
  },
  timeLimitMinutes: {
    type: Number,
    default: 20,
  },
  wordLimit: {
    type: Number,
    default: 300,
  },
  sampleEssay: {
    type: String,
    description: 'A well-written sample essay for this topic',
  },
  keyPoints: [{
    type: String,
    description: 'Key points that should ideally be covered',
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

watTopicSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WatTopic', watTopicSchema);
