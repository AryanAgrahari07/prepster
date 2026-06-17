const express = require('express');
const router = express.Router();
const Question = require('./question.model');
const QuizSession = require('./quizSession.model');
const UserAnalytics = require('./userAnalytics.model');
const User = require('../user/user.model');
const { authenticate, optionalAuth, requirePro } = require('../../middleware/auth');
const { SESSION_STATUS, SESSION_TYPES, PLANS, FREE_DAILY_QUESTION_LIMIT } = require('../../shared/constants');
const { AppError } = require('../../middleware/errorHandler');
const { getRedis } = require('../../config/redis');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** ISO week key, e.g. '2024-W22' */
function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Midnight IST = 18:30 UTC. Returns seconds until then. */
function secondsUntilMidnightIST() {
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCHours(18, 30, 0, 0);
  if (midnight <= now) midnight.setUTCDate(midnight.getUTCDate() + 1);
  return Math.max(1, Math.floor((midnight - now) / 1000));
}

/** Update streak for a user after completing a session */
async function updateStreak(userId) {
  const user = await User.findById(userId).select('streak').lean();
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = user.streak?.lastActivityDate ? new Date(user.streak.lastActivityDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  let currentStreak = user.streak?.current || 0;
  const longest = user.streak?.longest || 0;

  if (!last || last.getTime() < today.getTime() - 86400000) {
    // Missed a day or first time — reset streak
    currentStreak = 1;
  } else if (last.getTime() === today.getTime()) {
    // Already logged today — no change
    return;
  } else {
    // Consecutive day
    currentStreak += 1;
  }

  await User.findByIdAndUpdate(userId, {
    'streak.current': currentStreak,
    'streak.longest': Math.max(longest, currentStreak),
    'streak.lastActivityDate': new Date(),
  });
}

/** Compute and persist weakAreas / strongAreas from topicStats */
async function updateWeakStrongAreas(userId) {
  const analytics = await UserAnalytics.findOne({ userId }).lean();
  if (!analytics?.topicStats) return;

  const sorted = Object.entries(analytics.topicStats)
    .filter(([, v]) => v.attempted > 0)
    .map(([topic, v]) => ({ topic, accuracy: v.correct / v.attempted }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const weakAreas = sorted.slice(0, 3).map(t => t.topic);
  const strongAreas = sorted.slice(-3).reverse().map(t => t.topic);

  await UserAnalytics.findOneAndUpdate(
    { userId },
    { $set: { weakAreas, strongAreas } }
  );
}

// ─── GET /v1/aptitude/topics ──────────────────────────────────────────────────
router.get('/topics', async (req, res, next) => {
  try {
    const topics = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { 
          _id: { topic: '$topic', subTopic: '$subTopic' }, 
          count: { $sum: 1 } 
      } },
      { $group: {
          _id: '$_id.topic',
          count: { $sum: '$count' },
          subTopics: {
            $push: {
              name: '$_id.subTopic',
              count: '$count'
            }
          }
      }},
      { $project: { topic: '$_id', count: 1, subTopics: 1, _id: 0 } }
    ]);
    res.json({ success: true, data: { topics } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /v1/aptitude/questions ───────────────────────────────────────────────
router.get('/questions', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const filter = { isActive: true };
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: limit } },
      { $project: { correctOption: 0, explanation: 0 } } // Never expose answers
    ]);

    res.json({ success: true, data: { questions } });
  } catch (err) { next(err); }
});

// ─── POST /v1/aptitude/sessions ───────────────────────────────────────────────
router.post('/sessions', authenticate, async (req, res, next) => {
  try {
    const { sessionType = SESSION_TYPES.PRACTICE, topic, subTopic, difficulty, limit = 10, companySlug, timeLimitSeconds } = req.body;

    // ── Freemium daily limit enforcement ──
    const isPro =
      req.user.subscription?.plan === PLANS.PRO &&
      req.user.subscription?.status === 'active' &&
      new Date(req.user.subscription?.expiresAt) > new Date();

    let redis, dailyKey, current;
    let limitToUse = parseInt(limit) || 10;

    if (!isPro) {
      // Use Redis counter as the source of truth (faster, and reset by cron)
      redis = getRedis();
      dailyKey = `daily_q:${req.user._id}`;
      current = parseInt(await redis.get(dailyKey) || '0');

      if (current >= FREE_DAILY_QUESTION_LIMIT) {
        throw new AppError(
          `Daily free limit of ${FREE_DAILY_QUESTION_LIMIT} questions reached. Upgrade to Pro for unlimited practice.`,
          403,
          4002
        );
      }

      // Cap the requested limit to whatever is remaining
      const remaining = FREE_DAILY_QUESTION_LIMIT - current;
      if (limitToUse > remaining) {
        limitToUse = remaining;
      }
    }

    const filter = { isActive: true };
    if (topic) filter.topic = topic;
    if (subTopic) filter.subTopic = subTopic;
    if (difficulty) filter.difficulty = difficulty;
    if (companySlug) filter.companies = companySlug;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: limitToUse } },
      { $project: { _id: 1 } }
    ]);

    if (questions.length === 0) throw new AppError('No questions found for the selected criteria', 404, 4004);

    if (!isPro) {
      // Increment counter strictly by the actual number of questions returned
      const ttl = secondsUntilMidnightIST();
      await redis.setex(dailyKey, ttl, String(current + questions.length));
    }

    const session = await QuizSession.create({
      userId: req.user._id,
      sessionType,
      companySlug: companySlug || null,
      status: SESSION_STATUS.IN_PROGRESS,
      questions: questions.map(q => ({ questionId: q._id })),
      timeLimitSeconds: timeLimitSeconds || null,
    });

    res.status(201).json({ success: true, data: { sessionId: session._id } });
  } catch (err) { next(err); }
});

// ─── PATCH /v1/aptitude/sessions/:id ─────────────────────────────────────────
router.patch('/sessions/:id', authenticate, async (req, res, next) => {
  try {
    const { questionId, selectedOption, timeTakenSeconds } = req.body;
    const session = await QuizSession.findOne({ _id: req.params.id, userId: req.user._id });

    if (!session) throw new AppError('Session not found', 404, 4004);
    if (session.status !== SESSION_STATUS.IN_PROGRESS) throw new AppError('Session is already completed', 400, 4008);

    const question = await Question.findById(questionId).select('correctOption topic').lean();
    if (!question) throw new AppError('Question not found', 404, 4004);

    const isCorrect = selectedOption === question.correctOption;

    const questionIndex = session.questions.findIndex(q => q.questionId.toString() === questionId);
    if (questionIndex > -1) {
      session.questions[questionIndex].selectedOption = selectedOption;
      session.questions[questionIndex].isCorrect = isCorrect;
      session.questions[questionIndex].timeTakenSeconds = timeTakenSeconds || 0;

      // ─── Adaptive Engine Logic ───
      // Adjust difficulty of future questions based on last 3 answers
      if (['practice', 'daily-challenge'].includes(session.sessionType)) {
        const answeredIndexes = session.questions
          .map((q, i) => q.selectedOption !== null ? i : -1)
          .filter(i => i !== -1)
          .sort((a, b) => a - b);
          
        if (answeredIndexes.length >= 3) {
          const lastThree = answeredIndexes.slice(-3).map(i => session.questions[i]);
          const allCorrect = lastThree.every(q => q.isCorrect);
          const allWrong = lastThree.every(q => !q.isCorrect);
          
          let targetDifficulty = null;
          if (allCorrect) targetDifficulty = 'hard';
          else if (allWrong) targetDifficulty = 'easy';
          
          if (targetDifficulty) {
            const unattemptedIndexes = session.questions
              .map((q, i) => q.selectedOption === null && i > questionIndex ? i : -1)
              .filter(i => i !== -1);
              
            if (unattemptedIndexes.length > 0) {
              const mongoose = require('mongoose');
              const usedIds = session.questions.map(q => new mongoose.Types.ObjectId(q.questionId.toString()));
              
              const matchFilter = { 
                isActive: true, 
                difficulty: targetDifficulty,
                _id: { $nin: usedIds }
              };
              if (question.topic) matchFilter.topic = question.topic;

              const newQs = await Question.aggregate([
                { $match: matchFilter },
                { $sample: { size: unattemptedIndexes.length } },
                { $project: { _id: 1 } }
              ]);
              
              newQs.forEach((newQ, idx) => {
                const targetIdx = unattemptedIndexes[idx];
                if (targetIdx !== undefined) {
                  session.questions[targetIdx].questionId = newQ._id;
                }
              });
            }
          }
        }
      }

      await session.save();
    }

    await session.populate('questions.questionId', 'text options correctOption explanation topic subTopic difficulty');
    res.json({ success: true, message: 'Answer recorded', data: { session } });
  } catch (err) { next(err); }
});

// ─── POST /v1/aptitude/sessions/:id/finish ────────────────────────────────────
router.post('/sessions/:id/finish', authenticate, async (req, res, next) => {
  try {
    const session = await QuizSession.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('questions.questionId', 'text options correctOption explanation topic subTopic difficulty');
    if (!session) throw new AppError('Session not found', 404, 4004);
    if (session.status === SESSION_STATUS.COMPLETED) {
      return res.json({ success: true, data: { session } });
    }

    let correct = 0, incorrect = 0, unattempted = 0;
    // Track per-topic increments for analytics
    const topicInc = {};

    for (const q of session.questions) {
      const topic = q.questionId?.topic;
      if (!topicInc[topic]) topicInc[topic] = { attempted: 0, correct: 0 };

      if (q.selectedOption === null || q.selectedOption === undefined) {
        unattempted++;
      } else {
        topicInc[topic].attempted++;
        if (q.isCorrect) {
          correct++;
          topicInc[topic].correct++;
        } else {
          incorrect++;
        }
      }
    }

    const totalQuestions = session.questions.length;
    session.score = {
      correct,
      incorrect,
      unattempted,
      totalMarks: correct,
      percentage: totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0,
    };
    session.status = SESSION_STATUS.COMPLETED;
    session.completedAt = new Date();
    await session.save();

    // ── Update UserAnalytics atomically ──────────────────────────────────────
    const attempted = totalQuestions - unattempted;
    const topicStatInc = {};
    for (const [topic, vals] of Object.entries(topicInc)) {
      if (topic && topic !== 'undefined') {
        topicStatInc[`topicStats.${topic}.attempted`] = vals.attempted;
        topicStatInc[`topicStats.${topic}.correct`] = vals.correct;
      }
    }

    await UserAnalytics.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: {
          totalQuestionsAttempted: attempted,
          totalCorrect: correct,
          ...topicStatInc,
        },
        $push: {
          dailyActivity: {
            $each: [{
              date: new Date(),
              questionsAttempted: attempted,
              accuracy: attempted > 0 ? (correct / attempted) * 100 : 0,
            }],
            $slice: -90, // Keep last 90 days only
          }
        },
      },
      { upsert: true }
    );

    // ── Update streak ─────────────────────────────────────────────────────────
    updateStreak(req.user._id).catch(err =>
      console.error('[streak] Update failed:', err.message)
    );

    // ── Compute weak/strong areas ─────────────────────────────────────────────
    updateWeakStrongAreas(req.user._id).catch(err =>
      console.error('[analytics] Weak/strong area update failed:', err.message)
    );

    // ── Update leaderboard (Redis sorted set) ─────────────────────────────────
    if (attempted > 0) {
      const accuracy = (correct / attempted) * 100;
      const week = getWeekKey();
      const redis = getRedis();
      redis.zadd(`leaderboard:${week}`, accuracy, req.user._id.toString()).catch(err =>
        console.error('[leaderboard] Redis write failed:', err.message)
      );
    }

    res.json({ success: true, data: { session } });
  } catch (err) { next(err); }
});

// ─── GET /v1/aptitude/sessions/:id ───────────────────────────────────────────
router.get('/sessions/:id', authenticate, async (req, res, next) => {
  try {
    const session = await QuizSession.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('questions.questionId', 'text options correctOption explanation topic subTopic difficulty');
    if (!session) throw new AppError('Session not found', 404, 4004);
    res.json({ success: true, data: { session } });
  } catch (err) { next(err); }
});

// ─── GET /v1/aptitude/analytics/me (Pro only) ────────────────────────────────
router.get('/analytics/me', authenticate, requirePro, async (req, res, next) => {
  try {
    const analytics = await UserAnalytics.findOne({ userId: req.user._id }).lean();
    if (!analytics) {
      return res.json({ success: true, data: { analytics: null } });
    }

    const recentSessions = await QuizSession.find({ userId: req.user._id, status: SESSION_STATUS.COMPLETED })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('sessionType score createdAt companySlug')
      .lean();

    res.json({ success: true, data: { analytics, recentSessions } });
  } catch (err) { next(err); }
});

// ─── GET /v1/aptitude/daily-challenge ────────────────────────────────────────
// 20 questions fixed per day for all users, cached in Redis until midnight IST
router.get('/daily-challenge', authenticate, async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = `daily_challenge:${today}`;
    const redis = getRedis();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completedSession = await QuizSession.findOne({
      userId: req.user._id,
      sessionType: 'daily-challenge',
      status: 'completed',
      createdAt: { $gte: startOfDay }
    });

    const isCompleted = !!completedSession;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: { questions: JSON.parse(cached), date: today, isCompleted } });
    }

    const questions = await Question.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 20 } },
      { $project: { correctOption: 0, explanation: 0 } }
    ]);

    const ttl = secondsUntilMidnightIST();
    await redis.setex(cacheKey, ttl, JSON.stringify(questions));

    res.json({ success: true, data: { questions, date: today, isCompleted } });
  } catch (err) { next(err); }
});

// ─── GET /v1/aptitude/leaderboard ────────────────────────────────────────────
router.get('/leaderboard', authenticate, async (req, res, next) => {
  try {
    const redis = getRedis();
    const week = getWeekKey();
    const raw = await redis.zrevrange(`leaderboard:${week}`, 0, 19, 'WITHSCORES');

    const entries = [];
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ userId: raw[i], accuracy: parseFloat(raw[i + 1]) });
    }

    const ids = entries.map(e => e.userId);
    const users = await User.find({ _id: { $in: ids } })
      .select('profile.firstName profile.lastName profile.college profile.avatar')
      .lean();

    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
    const leaderboard = entries.map((e, idx) => ({
      rank: idx + 1,
      accuracy: e.accuracy,
      user: userMap[e.userId] || { profile: { firstName: 'Unknown', lastName: '' } },
    }));

    res.json({ success: true, data: { leaderboard, week } });
  } catch (err) { next(err); }
});

// ─── GET /v1/aptitude/mock-tests ─────────────────────────────────────────────
// Returns the list of predefined mock test configurations
router.get('/mock-tests', authenticate, (req, res) => {
  const configs = [
    {
      id: 'placement-30',
      title: 'Placement Aptitude Sprint',
      duration: '30 min',
      durationSeconds: 1800,
      questions: 30,
      topics: ['quantitative', 'logical'],
      badge: 'Quick',
      desc: 'A rapid-fire aptitude round mimicking Tier-1 campus placement tests.',
    },
    {
      id: 'full-aptitude-60',
      title: 'Full Aptitude Mock',
      duration: '60 min',
      durationSeconds: 3600,
      questions: 60,
      topics: ['quantitative', 'logical', 'verbal', 'di'],
      badge: 'Standard',
      desc: 'Full-length mock covering all aptitude topics — ideal for TCS, Infosys, Wipro prep.',
    },
    {
      id: 'sde-core-60',
      title: 'SDE Core CS Mock',
      duration: '60 min',
      durationSeconds: 3600,
      questions: 50,
      topics: ['dsa', 'os', 'dbms', 'cn', 'oops'],
      badge: 'SDE Focus',
      desc: 'Core CS subjects test — perfect for on-campus SDE interviews.',
    },
    {
      id: 'mega-90',
      title: 'Mega Placement Mock',
      duration: '90 min',
      durationSeconds: 5400,
      questions: 90,
      topics: ['quantitative', 'logical', 'verbal', 'dsa', 'dbms', 'os'],
      badge: 'Full Length',
      desc: 'The complete placement test experience — aptitude + core CS combined.',
    },
    {
      id: 'system-design-45',
      title: 'System Design Foundations',
      duration: '45 min',
      durationSeconds: 2700,
      questions: 40,
      topics: ['system-design', 'dsa'],
      badge: 'Advanced',
      desc: 'System Design + DSA combo — crack product company final rounds.',
    },
    {
      id: 'sql-dbms-30',
      title: 'SQL & DBMS Blitz',
      duration: '30 min',
      durationSeconds: 1800,
      questions: 30,
      topics: ['sql', 'dbms'],
      badge: 'Quick',
      desc: 'Focused SQL & DBMS prep for data-heavy roles and analytics rounds.',
    },
  ];

  res.json({ success: true, data: { mockTests: configs } });
});

module.exports = router;

