// ─── User Roles ──────────────────────────────────────────────────────────────
const ROLES = {
  STUDENT: 'student',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
};

// ─── Subscription Plans ───────────────────────────────────────────────────────
const PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

const PLAN_DETAILS = {
  free: { label: 'Free', price: 0, dailyQuestionLimit: 20 },
  'pro-monthly': { label: 'Pro Monthly', price: 29900, durationDays: 30 },
  'pro-annual': { label: 'Pro Annual', price: 79900, durationDays: 365 },
};

// ─── Subscription Status ──────────────────────────────────────────────────────
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PAYMENT_FAILED: 'payment-failed',
};

// ─── Quiz / Session ───────────────────────────────────────────────────────────
const SESSION_TYPES = {
  PRACTICE: 'practice',
  DAILY_CHALLENGE: 'daily-challenge',
  MOCK_TEST: 'mock-test',
  COMPANY_MOCK: 'company-mock',
};

const SESSION_STATUS = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

// ─── Aptitude Topics ──────────────────────────────────────────────────────────
const TOPICS = {
  // Aptitude & Reasoning
  QUANTITATIVE: 'quantitative',
  LOGICAL: 'logical',
  VERBAL: 'verbal',
  DI: 'di',
  // Core CS / SDE Subjects
  DSA: 'dsa',
  OS: 'os',
  DBMS: 'dbms',
  SYSTEM_DESIGN: 'system-design',
  CN: 'cn',
  OOPS: 'oops',
  SQL: 'sql',
};

const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// ─── Companies ────────────────────────────────────────────────────────────────
const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant',
  'HCL', 'Capgemini', 'Tech Mahindra', 'Amazon', 'Zoho',
];

// ─── Application Status ───────────────────────────────────────────────────────
const APPLICATION_STATUS = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview-scheduled',
  OFFER_EXTENDED: 'offer-extended',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// ─── Job Types ────────────────────────────────────────────────────────────────
const JOB_TYPES = {
  FULL_TIME: 'full-time',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
};

const WORK_MODES = {
  REMOTE: 'remote',
  HYBRID: 'hybrid',
  ONSITE: 'onsite',
};

const JOB_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  FILLED: 'filled',
};

// ─── App Error Codes ──────────────────────────────────────────────────────────
const APP_ERRORS = {
  INVALID_TOKEN: { code: 4001, status: 401, message: 'Invalid or expired access token' },
  DAILY_LIMIT_REACHED: { code: 4002, status: 403, message: 'Daily free limit reached. Upgrade to Pro.' },
  PRO_REQUIRED: { code: 4003, status: 403, message: 'Pro subscription required for this feature' },
  NOT_FOUND: { code: 4004, status: 404, message: 'Resource not found' },
  ALREADY_APPLIED: { code: 4005, status: 409, message: 'You have already applied to this job' },
  INVALID_PAYMENT_SIGNATURE: { code: 4006, status: 400, message: 'Invalid payment signature' },
  RATE_LIMITED: { code: 4007, status: 429, message: 'Too many requests. Please try again later.' },
  VALIDATION_ERROR: { code: 4008, status: 400, message: 'Validation error' },
  DB_ERROR: { code: 5001, status: 500, message: 'Database operation failed' },
  EXTERNAL_SERVICE_ERROR: { code: 5002, status: 500, message: 'External service error' },
};

// ─── Redis Key Prefixes ───────────────────────────────────────────────────────
const REDIS_KEYS = {
  refreshToken: (userId) => `refresh:${userId}`,
  dailyQuestions: (userId) => `daily_q:${userId}`,
  dailyChallenge: (date) => `daily_challenge:${date}`,
  companyTrack: (slug) => `company_track:${slug}`,
  jobsFeed: (hash) => `jobs_feed:${hash}`,
  leaderboard: (week) => `leaderboard:${week}`,
  rateLimit: (ip, route) => `rl:${ip}:${route}`,
  emailVerify: (token) => `email_verify:${token}`,
  passwordReset: (token) => `pwd_reset:${token}`,
};

// ─── Free tier limit ──────────────────────────────────────────────────────────
const FREE_DAILY_QUESTION_LIMIT = parseInt(process.env.FREE_DAILY_QUESTION_LIMIT || '20');

module.exports = {
  ROLES, PLANS, PLAN_DETAILS, SUBSCRIPTION_STATUS,
  SESSION_TYPES, SESSION_STATUS, TOPICS, DIFFICULTY,
  COMPANIES, APPLICATION_STATUS, JOB_TYPES, WORK_MODES, JOB_STATUS,
  APP_ERRORS, REDIS_KEYS, FREE_DAILY_QUESTION_LIMIT,
};
