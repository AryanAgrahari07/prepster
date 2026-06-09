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
  SE: 'se',
  WEB: 'web',
  CLOUD: 'cloud',
  ML: 'ml',
};

const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// ─── Subtopics per Topic ──────────────────────────────────────────────────────
const SUBTOPICS = {
  quantitative: [
    'number_system', 'hcf_lcm', 'percentages', 'profit_loss',
    'simple_compound_interest', 'compound_interest', 'ratio_proportion',
    'averages', 'mixtures_alligations', 'time_work', 'time_speed_distance',
    'permutation_combination', 'probability', 'boats_streams',
    'pipes_cistern', 'problems_on_trains', 'partnership', 'area',
    'volume_surface_area', 'surds_indices', 'simplification',
    'square_cube_root', 'problems_on_ages', 'banker_discount',
    'true_discount', 'odd_man_out', 'height_distance', 'stocks_shares',
  ],
  logical: [
    'coding_decoding', 'blood_relations', 'direction_sense', 'syllogisms',
    'seating_arrangement', 'number_series', 'letter_series', 'clocks',
    'calendars', 'venn_diagrams', 'statement_assumption', 'course_of_action',
    'statement_conclusion', 'cause_effect', 'logical_problems',
    'statement_argument', 'cube_dice', 'mirror_water_images',
    'embedded_figures', 'figure_matrix', 'grouping_of_figures',
    'paper_folding', 'verbal_reasoning', 'puzzles', 'data_sufficiency',
    'input_output', 'ranking_arrangement', 'alphanumeric_series',
    'analogy', 'classification',
  ],
  verbal: [
    'reading_comprehension', 'sentence_correction', 'synonyms', 'antonyms',
    'idioms_phrases', 'fill_in_blanks', 'para_jumbles',
    'one_word_substitution', 'spellings', 'sentence_improvement',
    'change_of_voice', 'selecting_words', 'active_passive_voice',
    'direct_indirect_speech', 'articles', 'prepositions', 'conjunctions',
    'closet_test', 'ordering_words',
  ],
  di: ['tabular', 'bar_graphs', 'line_charts', 'pie_charts'],
  dsa: ['arrays', 'strings', 'linked_list', 'trees', 'graphs', 'sorting', 'searching', 'dynamic_programming', 'recursion', 'stack_queue', 'heap'],
  os: ['processes', 'threads', 'scheduling', 'memory_management', 'deadlocks', 'paging', 'file_systems'],
  dbms: ['normalization', 'sql_queries', 'transactions', 'indexing', 'er_diagrams', 'concurrency'],
  sql: ['joins', 'subqueries', 'views', 'indexes', 'triggers', 'aggregate_functions', 'window_functions'],
  cn: ['osi_model', 'tcp_ip', 'http_https', 'dns', 'routing', 'subnetting'],
  oops: ['inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'design_patterns'],
  'system-design': ['scalability', 'load_balancing', 'caching', 'databases', 'microservices', 'cap_theorem'],
  se: ['sdlc', 'agile', 'testing', 'software_models', 'project_management'],
  web: ['html_css', 'javascript', 'react', 'nodejs', 'dom', 'rest_api'],
  cloud: ['aws', 'azure', 'virtualization', 'saas_paas_iaas', 'cloud_security'],
  ml: ['supervised_learning', 'unsupervised_learning', 'neural_networks', 'deep_learning', 'statistics'],
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
  SESSION_TYPES, SESSION_STATUS, TOPICS, SUBTOPICS, DIFFICULTY,
  COMPANIES, APPLICATION_STATUS, JOB_TYPES, WORK_MODES, JOB_STATUS,
  APP_ERRORS, REDIS_KEYS, FREE_DAILY_QUESTION_LIMIT,
};
