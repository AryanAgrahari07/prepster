const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  companySlug: { type: String, required: true, index: true },
  durationMinutes: { type: Number, required: true, default: 60 },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
