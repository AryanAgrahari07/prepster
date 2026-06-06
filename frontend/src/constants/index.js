// Mirrors backend shared/constants.js — keep in sync

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

export const ROLES = {
  STUDENT: 'student',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const TOPICS = [
  { value: 'quantitative', label: 'Quantitative Aptitude' },
  { value: 'logical',      label: 'Logical Reasoning' },
  { value: 'verbal',       label: 'Verbal Ability' },
  { value: 'di',           label: 'Data Interpretation' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy',   label: 'Easy',   color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'hard',   label: 'Hard',   color: 'text-red-500' },
];

export const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant',
  'HCL', 'Capgemini', 'Tech Mahindra', 'Amazon', 'Zoho',
];

export const SESSION_TYPES = {
  PRACTICE:      'practice',
  DAILY:         'daily-challenge',
  MOCK:          'mock-test',
  COMPANY_MOCK:  'company-mock',
};

export const FREE_DAILY_QUESTION_LIMIT = 20;
