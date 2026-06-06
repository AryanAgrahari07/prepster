const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  audience: { type: String, enum: ['all', 'pro', 'free'], default: 'all' },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
