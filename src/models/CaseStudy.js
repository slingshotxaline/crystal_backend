const mongoose = require('mongoose');

/**
 * Case studies follow: Requirement -> Route Decision -> Execution -> Approved Outcome.
 * `customerPermission` gates whether the customer name/logo/testimonial can be shown.
 */
const CaseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, trim: true }, // e.g. "Fashion / GOH", "Buyer Consolidation"
    requirement: { type: String, trim: true },
    routeDecision: { type: String, trim: true },
    execution: { type: String, trim: true },
    approvedOutcome: { type: String, trim: true },
    customerName: { type: String, trim: true },
    customerLogoUrl: { type: String, trim: true },
    testimonial: { type: String, trim: true },
    customerPermissionGranted: { type: Boolean, default: false },
    images: [{ type: String }],
    relatedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaseStudy', CaseStudySchema);
