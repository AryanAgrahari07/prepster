const mongoose = require('mongoose');
const { ROLES, PLANS } = require('../../shared/constants');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      default: null, // null for OAuth users
    },
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
    },
    profile: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      avatar: { type: String, default: null }, // Cloudinary URL
      college: { type: String, trim: true },
      branch: { type: String, trim: true }, // 'CSE', 'ECE', etc.
      graduationYear: { type: Number, min: 2020, max: 2035 },
      cgpa: { type: Number, min: 0, max: 10 },
      targetCompanies: [{ type: String }],
      phone: { type: String, trim: true },
      resumeUrl: { type: String, default: null },
    },
    subscription: {
      plan: { type: String, enum: Object.values(PLANS), default: PLANS.FREE },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'payment-failed'],
        default: 'active',
      },
      startedAt: { type: Date },
      expiresAt: { type: Date },
      razorpaySubscriptionId: { type: String },
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActivityDate: { type: Date },
    },
    dailyUsage: {
      questionsToday: { type: Number, default: 0 },
      resetAt: { type: Date },
    },
    isEmailVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true, // createdAt, updatedAt
    strict: true,     // Reject unknown fields
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'subscription.expiresAt': 1 });
userSchema.index({ 'profile.graduationYear': 1 });
userSchema.index({ role: 1 });

// ─── Virtual: full name ───────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// ─── Virtual: isPro ───────────────────────────────────────────────────────────
userSchema.virtual('isPro').get(function () {
  return (
    this.subscription?.plan === PLANS.PRO &&
    this.subscription?.status === 'active' &&
    this.subscription?.expiresAt > new Date()
  );
});

// ─── Virtual: profileCompletionScore ─────────────────────────────────────────
userSchema.virtual('profileCompletionScore').get(function () {
  const fields = [
    this.profile?.firstName,
    this.profile?.lastName,
    this.profile?.college,
    this.profile?.branch,
    this.profile?.graduationYear,
    this.profile?.cgpa,
    this.profile?.phone,
    this.profile?.avatar,
    this.profile?.targetCompanies?.length > 0,
    this.isEmailVerified,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
});

// ─── Exclude sensitive fields in toJSON ───────────────────────────────────────
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
