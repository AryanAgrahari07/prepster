const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const User = require('./user.model');
const { AppError } = require('../../middleware/errorHandler');
const { APP_ERRORS } = require('../../shared/constants');
const { uploadToCloudinary } = require('../../config/cloudinary');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /v1/users/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -__v');
    if (!user) throw AppError.fromAppError(APP_ERRORS.NOT_FOUND);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
});

// PATCH /v1/users/me
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const updates = {};

    // ─── Engineering & General profile fields ─────────────────────────────────
    if (req.body.firstName)       updates['profile.firstName']       = req.body.firstName;
    if (req.body.lastName)        updates['profile.lastName']        = req.body.lastName;
    if (req.body.college)         updates['profile.college']         = req.body.college;
    if (req.body.branch)          updates['profile.branch']          = req.body.branch;
    if (req.body.graduationYear)  updates['profile.graduationYear']  = req.body.graduationYear;
    if (req.body.cgpa !== undefined) updates['profile.cgpa']         = req.body.cgpa;
    if (req.body.targetCompanies) updates['profile.targetCompanies'] = req.body.targetCompanies;
    if (req.body.phone)           updates['profile.phone']           = req.body.phone;
    
    if (req.body.resumeUrl === null) updates['profile.resumeUrl'] = null;
    if (req.body.resumeFileName === null) updates['profile.resumeFileName'] = null;

    // ─── Stream & Onboarding ──────────────────────────────────────────────────
    if (req.body.stream && ['engineering', 'mba'].includes(req.body.stream)) {
      updates.stream = req.body.stream;
    }
    if (typeof req.body.onboardingCompleted === 'boolean') {
      updates.onboardingCompleted = req.body.onboardingCompleted;
    }

    // ─── MBA profile fields ───────────────────────────────────────────────────
    if (req.body.instituteType)           updates['mbaProfile.instituteType']           = req.body.instituteType;
    if (req.body.mbaProgramme)            updates['mbaProfile.mbaProgramme']            = req.body.mbaProgramme;
    if (req.body.specialization)          updates['mbaProfile.specialization']          = req.body.specialization;
    if (req.body.workExperienceMonths !== undefined) updates['mbaProfile.workExperienceMonths'] = req.body.workExperienceMonths;
    if (req.body.undergraduateDegree)     updates['mbaProfile.undergraduateDegree']     = req.body.undergraduateDegree;
    if (req.body.targetSectors)           updates['mbaProfile.targetSectors']           = req.body.targetSectors;
    if (req.body.targetRoles)             updates['mbaProfile.targetRoles']             = req.body.targetRoles;
    if (req.body.catScore !== undefined)  updates['mbaProfile.catScore']                = req.body.catScore;
    if (req.body.xatScore !== undefined)  updates['mbaProfile.xatScore']                = req.body.xatScore;
    if (req.body.gmatScore !== undefined) updates['mbaProfile.gmatScore']               = req.body.gmatScore;
    if (req.body.summerInternship)        updates['mbaProfile.summerInternship']        = req.body.summerInternship;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true })
      .select('-passwordHash -__v');
    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (err) { next(err); }
});

// POST /v1/users/me/avatar
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400, 4008);
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'prepster/avatars',
      resource_type: 'image',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': result.secure_url },
      { new: true }
    ).select('-passwordHash -__v');
    res.json({ success: true, data: { avatarUrl: result.secure_url, user } });
  } catch (err) { next(err); }
});

// POST /v1/users/me/resume
router.post('/me/resume', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400, 4008);
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'prepster/resumes',
      resource_type: 'raw', // For PDFs and docs
    });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        'profile.resumeUrl': result.secure_url,
        'profile.resumeFileName': req.file.originalname 
      },
      { new: true }
    ).select('-passwordHash -__v');
    res.json({ success: true, data: { resumeUrl: result.secure_url, user } });
  } catch (err) { next(err); }
});

// PATCH /v1/users/me/password
router.patch('/me/password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new password are required', 400, 4000);
    }
    
    const user = await User.findById(req.user._id);
    if (!user) throw AppError.fromAppError(APP_ERRORS.NOT_FOUND);
    if (!user.passwordHash) {
      throw new AppError('OAuth users cannot change password', 400, 4000);
    }
    
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Incorrect current password', 401, 4001);
    }
    
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

// GET /v1/users/me/stats
router.get('/me/stats', authenticate, async (req, res, next) => {
  try {
    const UserAnalytics = require('../aptitude/userAnalytics.model');
    const QuizSession = require('../aptitude/quizSession.model');

    const [analytics, totalSessions, recentSessions] = await Promise.all([
      UserAnalytics.findOne({ userId: req.user._id }).lean(),
      QuizSession.countDocuments({ userId: req.user._id, status: 'completed' }),
      QuizSession.find({ userId: req.user._id, status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('sessionType score createdAt companySlug timeLimitSeconds')
        .lean(),
    ]);

    const user = await User.findById(req.user._id).select('streak subscription profile').lean();

    res.json({
      success: true,
      data: {
        totalQuestionsAttempted: analytics?.totalQuestionsAttempted || 0,
        totalCorrect: analytics?.totalCorrect || 0,
        accuracy: analytics?.totalQuestionsAttempted
          ? Math.round((analytics.totalCorrect / analytics.totalQuestionsAttempted) * 100)
          : 0,
        totalSessions,
        streak: user.streak,
        weakAreas: analytics?.weakAreas || [],
        companyReadiness: analytics?.companyReadiness || {},
        recentSessions: recentSessions || [],
        profileCompletion: (() => {
          const p = user.profile;
          const fields = [p?.firstName, p?.lastName, p?.college, p?.branch, p?.graduationYear, p?.cgpa, p?.phone, p?.avatar, p?.targetCompanies?.length > 0];
          return Math.round((fields.filter(Boolean).length / fields.length) * 100);
        })(),
      },
    });
  } catch (err) { next(err); }
});


// DELETE /v1/users/me
router.delete('/me', authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isDeleted: true, deletedAt: new Date() });
    res.json({ success: true, message: 'Account deletion requested. Your data will be removed in 30 days.' });
  } catch (err) { next(err); }
});

module.exports = router;
