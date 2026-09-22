const express = require('express');
const { body } = require('express-validator');
const enquiryController = require('../controllers/enquiryController');
const validateRequest = require('../middleware/validateRequest');
const honeypotGuard = require('../middleware/honeypot');
const { formLimiter } = require('../middleware/rateLimiter');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

const enquiryValidation = [
  body('type').isIn(['general', 'partnership', 'careers']),
  body('fullName').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('privacyConsent').equals('true').withMessage('Privacy consent is required'),
];

router.post('/', formLimiter, honeypotGuard, enquiryValidation, validateRequest, enquiryController.createEnquiry);

router.get('/', protect, restrictTo('admin', 'editor', 'viewer'), enquiryController.listEnquiries);
router.patch('/:id', protect, restrictTo('admin', 'editor'), enquiryController.updateEnquiry);

module.exports = router;
