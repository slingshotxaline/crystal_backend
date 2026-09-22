const Enquiry = require('../models/Enquiry');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/sendEmail');

const TEAM_EMAIL_BY_TYPE = {
  general: process.env.NOTIFY_EMAIL_GENERAL,
  partnership: process.env.NOTIFY_EMAIL_PARTNERSHIP,
  careers: process.env.NOTIFY_EMAIL_CAREERS,
};

/**
 * POST /api/enquiries
 * Handles General Contact, Partnership, and Careers submissions.
 * `type` in the request body decides routing.
 */
exports.createEnquiry = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  delete payload.honeypot;

  const enquiry = await Enquiry.create(payload);

  const notifyTo = TEAM_EMAIL_BY_TYPE[enquiry.type] || process.env.NOTIFY_EMAIL_GENERAL;
  await sendEmail({
    to: notifyTo,
    subject: `New ${enquiry.type} enquiry ${enquiry.referenceCode}`,
    html: `
      <h2>New ${enquiry.type} enquiry</h2>
      <p><strong>Reference:</strong> ${enquiry.referenceCode}</p>
      <p><strong>Name:</strong> ${enquiry.fullName} &middot; <strong>Company:</strong> ${enquiry.company || '—'}</p>
      <p><strong>Email:</strong> ${enquiry.email} &middot; <strong>Phone:</strong> ${enquiry.phone || '—'}</p>
      <p><strong>Message:</strong> ${enquiry.message}</p>
    `,
  });

  res.status(201).json({
    success: true,
    message: 'Thank you. Your message has been received.',
    referenceCode: enquiry.referenceCode,
  });
});

exports.listEnquiries = catchAsync(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Enquiry.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), limit: Number(limit), items });
});

exports.updateEnquiry = catchAsync(async (req, res) => {
  const allowed = ['status', 'assignedTo'];
  const updates = {};
  allowed.forEach((key) => {
    if (key in req.body) updates[key] = req.body[key];
  });

  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
  res.json({ success: true, enquiry });
});
