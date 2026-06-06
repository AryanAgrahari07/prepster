const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');
const { APP_ERRORS } = require('../shared/constants');

/**
 * Runs after a chain of express-validator checks.
 * If any fail, throws a 400 AppError with the first error message.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array()[0];
    return next(
      new AppError(first.msg, 400, APP_ERRORS.VALIDATION_ERROR.code, first.path)
    );
  }
  next();
};

module.exports = { validate };
