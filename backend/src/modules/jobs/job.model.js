const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin or employer
    companyName: { type: String, required: true, index: true },
    companyLogo: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['full-time', 'internship', 'contract'], required: true },
    location: { type: String },
    workMode: { type: String, enum: ['remote', 'hybrid', 'onsite'], required: true },
    ctc: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'INR' },
      isDisclosed: { type: Boolean, default: true },
    },
    eligibility: {
      batchYears: [{ type: Number }],
      branches: [{ type: String }],
      minCGPA: { type: Number },
    },
    skillsRequired: [{ type: String }],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    externalApplyUrl: { type: String }, // If null, means they apply via Prepster directly
    deadline: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
