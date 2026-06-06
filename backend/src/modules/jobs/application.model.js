const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Denormalized for easy employer queries
    status: { 
      type: String, 
      enum: ['applied', 'under-review', 'shortlisted', 'rejected', 'hired', 'withdrawn'], 
      default: 'applied' 
    },
    resumeUrl: { type: String }, // Can be snapshot from user profile at time of applying
    answers: [{ 
      question: { type: String },
      answer: { type: String }
    }],
    appliedAt: { type: Date, default: Date.now },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A user can only apply to a specific job once
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
