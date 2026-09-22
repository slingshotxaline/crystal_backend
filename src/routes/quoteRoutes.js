const express = require('express');
const { body } = require('express-validator');
const quoteController = require('../controllers/quoteController');
const validateRequest = require('../middleware/validateRequest');
const honeypotGuard = require('../middleware/honeypot');
const { formLimiter } = require('../middleware/rateLimiter');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

const quoteValidation = [
  body('mode').isIn(['air', 'ocean', 'multimodal', 'inland', 'project', 'not_sure']),
  body('direction').isIn(['import', 'export', 'domestic']),
  body('origin').trim().notEmpty().withMessage('Origin is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('commodity').trim().notEmpty().withMessage('Commodity is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('contactName').trim().notEmpty().withMessage('Contact name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('privacyConsent').equals('true').withMessage('Privacy consent is required'),
];

// Public: submit a quote request
router.post('/', formLimiter, honeypotGuard, quoteValidation, validateRequest, quoteController.createQuote);

// CMS: list / view / update (admin + editor)
router.get('/', protect, restrictTo('admin', 'editor', 'viewer'), quoteController.listQuotes);
router.get('/:id', protect, restrictTo('admin', 'editor', 'viewer'), quoteController.getQuote);
router.patch('/:id', protect, restrictTo('admin', 'editor'), quoteController.updateQuote);

module.exports = router;
