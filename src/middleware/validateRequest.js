const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains; returns a clean 400 response
 * with the first error per field if validation fails.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Please check the highlighted fields.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validateRequest;
