const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // e.g., 'briefcase', 'shopping-cart', 'pie-chart' - icon identifiers for the frontend
    default: 'briefcase'
  },
  topCompanies: [{
    type: String, // e.g. "McKinsey", "BCG", "Bain"
  }],
  commonRoles: [{
    title: String,
    description: String,
  }],
  keySkills: [{
    type: String,
  }],
  hiringProcessOverview: {
    type: String,
  },
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

sectorSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Sector', sectorSchema, 'mbaSectors');
