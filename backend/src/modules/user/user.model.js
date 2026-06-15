const mongoose = require('mongoose');
const { ROLES, PLANS } = require('../../shared/constants');
const crypto = require('crypto');

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
      resumeFileName: { type: String, default: null },
    },
    // ─── Stream & Onboarding ──────────────────────────────────────────────────
    stream: {
      type: String,
      enum: ['engineering', 'mba'],
      default: 'engineering',
    },
    onboardingCompleted: { type: Boolean, default: false },
    // ─── MBA Profile (only populated when stream === 'mba') ───────────────────
    mbaProfile: {
      instituteType: {
        type: String,
        enum: ['iim', 'xlri', 'fms', 'nmims', 'spjimr', 'iift', 'mdi', 'tier2', 'other'],
        default: null,
      },
      mbaProgramme: { type: String, trim: true },         // 'PGDM', 'MBA', 'PGP'
      specialization: {
        type: String,
        enum: ['marketing', 'finance', 'hr', 'operations', 'strategy', 'general', null],
        default: null,
      },
      workExperienceMonths: { type: Number, min: 0, max: 600 },
      undergraduateDegree: { type: String, trim: true },  // 'B.Tech CSE', 'B.Com'
      targetSectors: [{ type: String }],
      targetRoles: [{ type: String }],
      catScore: { type: Number },
      xatScore: { type: Number },
      gmatScore: { type: Number },
      summerInternship: { type: String, trim: true },
    },
    // ─── Referral ─────────────────────────────────────────────────────────────
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCount: { type: Number, default: 0 },
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

// ─── Auto-generate referral code before save ─────────────────────────────────
userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. 'A3F9B2'
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'subscription.expiresAt': 1 });
userSchema.index({ 'profile.graduationYear': 1 });
userSchema.index({ role: 1 });
userSchema.index({ stream: 1 });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

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
  if (this.stream === 'mba') {
    const fields = [
      this.profile?.firstName,
      this.profile?.lastName,
      this.profile?.phone,
      this.profile?.avatar,
      this.mbaProfile?.specialization,
      this.mbaProfile?.workExperienceMonths !== undefined,
      this.mbaProfile?.undergraduateDegree,
      this.mbaProfile?.targetSectors?.length > 0,
      this.mbaProfile?.instituteType,
      this.isEmailVerified,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }
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
