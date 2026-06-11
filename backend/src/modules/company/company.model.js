const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String }, // Cloudinary URL
    sector: { type: String },
    hiringProcess: {
      overview: { type: String },
      rounds: [{
        name: { type: String },
        description: { type: String },
        duration: { type: String },
        questionsCount: { type: String },
        tips: [{ type: String }],
      }],
    },
    selectionCriteria: {
      minCGPA: { type: Number },
      tenthPercent: { type: Number },
      twelfthPercent: { type: Number },
      backlogs: { type: String },
      branches: [{ type: String }],
      batchYears: [{ type: Number }],
    },
    packageInfo: {
      fresher: { type: String },
      ninja: { type: String },
      digital: { type: String },
      notes: { type: String },
    },
    interviewExperiences: [{
      title: { type: String },
      content: { type: String },
      sourceUrl: { type: String },
      dateScraped: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
