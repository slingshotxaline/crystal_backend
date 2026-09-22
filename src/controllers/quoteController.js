const Quote = require('../models/Quote');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/sendEmail');

const TEAM_EMAIL_BY_SOURCE = {
  general_quote: process.env.NOTIFY_EMAIL_QUOTES,
  fashion_logistics: process.env.NOTIFY_EMAIL_FASHION,
  project_cargo: process.env.NOTIFY_EMAIL_PROJECT,
};

/**
 * POST /api/quotes
 * Frontend Quote form -> validation -> database -> email notification
 * -> routed to the responsible Crystal Express team.
 */
exports.createQuote = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
  delete payload.honeypot;

  const quote = await Quote.create(payload);

  const notifyTo = TEAM_EMAIL_BY_SOURCE[quote.source] || process.env.NOTIFY_EMAIL_QUOTES;
  await sendEmail({
    to: notifyTo,
    subject: `New quote request ${quote.referenceCode} — ${quote.mode.toUpperCase()} / ${quote.direction}`,
    html: `
      <h2>New Quote Request</h2>
      <p><strong>Reference:</strong> ${quote.referenceCode}</p>
      <p><strong>Mode:</strong> ${quote.mode} &middot; <strong>Direction:</strong> ${quote.direction}</p>
      <p><strong>Route:</strong> ${quote.origin} &rarr; ${quote.destination}</p>
      <p><strong>Commodity:</strong> ${quote.commodity}</p>
      <p><strong>Company:</strong> ${quote.company}</p>
      <p><strong>Contact:</strong> ${quote.contactName} — ${quote.email} ${quote.phone || ''}</p>
      <p><strong>Notes:</strong> ${quote.notes || '—'}</p>
    `,
  });

  await sendEmail({
    to: quote.email,
    subject: `We received your quote request — ${quote.referenceCode}`,
    html: `
      <p>Hello ${quote.contactName},</p>
      <p>Thank you for sharing your shipment details. Your reference is <strong>${quote.referenceCode}</strong>.
      A member of the Crystal Express team will review your requirement and respond with the practical options for your route.</p>
      <p>— Crystal Express Limited</p>
    `,
  });

  res.status(201).json({
    success: true,
    message: 'Quote request received. Our team will respond shortly.',
    referenceCode: quote.referenceCode,
  });
});

/**
 * GET /api/quotes (protected — CMS dashboard)
 */
exports.listQuotes = catchAsync(async (req, res) => {
  const { status, source, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Quote.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Quote.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), limit: Number(limit), items });
});

/**
 * GET /api/quotes/:id (protected)
 */
exports.getQuote = catchAsync(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });
  res.json({ success: true, quote });
});

/**
 * PATCH /api/quotes/:id (protected — update status / assignment)
 */
exports.updateQuote = catchAsync(async (req, res) => {
  const allowed = ['status', 'assignedTo'];
  const updates = {};
  allowed.forEach((key) => {
    if (key in req.body) updates[key] = req.body[key];
  });

  const quote = await Quote.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found.' });
  res.json({ success: true, quote });
});
