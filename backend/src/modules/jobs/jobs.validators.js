const { body } = require('express-validator');

// POST /v1/jobs  — employer posting a new job
const createJobRules = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('description')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters'),
  body('type')
    .isIn(['full-time', 'internship', 'contract'])
    .withMessage('Type must be full-time, internship, or contract'),
  body('workMode')
    .isIn(['remote', 'hybrid', 'onsite'])
    .withMessage('Work mode must be remote, hybrid, or onsite'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('ctc.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('CTC min must be a non-negative number'),
  body('ctc.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('CTC max must be a non-negative number'),
  body('eligibility.batchYears')
    .optional()
    .isArray()
    .withMessage('Batch years must be an array'),
  body('eligibility.minCGPA')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
  body('externalApplyUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('External apply link must be a valid URL'),
];

// POST /v1/jobs/:id/apply
const applyJobRules = [
  body('resumeUrl')
    .optional()
    .isURL()
    .withMessage('Resume URL must be a valid URL'),
];

// PATCH /v1/employer/applications/:id
const updateApplicationRules = [
  body('status')
    .isIn(['applied', 'under-review', 'shortlisted', 'rejected', 'hired', 'withdrawn'])
    .withMessage('Invalid application status'),
];

module.exports = { createJobRules, applyJobRules, updateApplicationRules };
