const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // The type of content being bookmarked
  itemType: {
    type: String,
    enum: ['question', 'job', 'gd-topic', 'case-study', 'company', 'guesstimate', 'pi-question'],
    required: true,
    index: true,
  },
  // Generic reference — not using a formal ref since types vary
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  // Denormalized snapshot for fast list rendering (avoids expensive populates)
  snapshot: {
    title: { type: String },      // question text, job title, topic name, etc.
    subtitle: { type: String },   // company name, difficulty, type, etc.
    href: { type: String },       // deep-link path in the app
  },
}, { timestamps: true });

// Ensure one bookmark per user+item combo
bookmarkSchema.index({ userId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
