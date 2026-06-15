const mongoose = require('mongoose');

const gdTopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['abstract', 'business', 'current_affairs', 'social', 'tech'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  background: {
    type: String,
    required: true,
    description: 'Context or background information about the topic',
  },
  keyPoints: [{
    type: String,
    description: 'Key discussion points',
  }],
  forArguments: [{
    type: String,
    description: 'Points in favor',
  }],
  againstArguments: [{
    type: String,
    description: 'Points against',
  }],
  vocabulary: [{
    word: String,
    meaning: String,
    usage: String,
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

gdTopicSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GdTopic', gdTopicSchema, 'mbaGdTopics');
