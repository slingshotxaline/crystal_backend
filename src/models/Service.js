const mongoose = require('mongoose');

/**
 * Service pages: Air Freight, Ocean Freight, Multimodal, Inland & Customs,
 * Project Logistics, Fashion Logistics, GOH, Warehousing, CFS, VAS.
 * Structured to support the Problem -> Solution -> Process -> Capability
 * -> Benefits -> Proof -> CTA template used on the frontend.
 */
const StepSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
  },
  { _id: false }
);

const FaqSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['air', 'ocean', 'multimodal', 'inland_customs', 'project', 'fashion', 'goh', 'warehousing', 'cfs', 'vas'],
      required: true,
    },
    heroTagline: { type: String, trim: true },
    heroHeadline: { type: String, trim: true },
    problemStatement: { type: String, trim: true },
    solutionSummary: { type: String, trim: true },
    whenToUse: { type: String, trim: true },
    requiredShipmentInfo: [{ type: String }],
    operatingSequence: [StepSchema],
    capabilities: [{ type: String }],
    benefits: [{ type: String }],
    evidence: [{ type: String }], // facility / specialist handling / membership references
    relatedIndustries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Industry' }],
    relatedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    caseStudy: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseStudy', default: null },
    faqs: [FaqSchema],
    seo: {
      metaTitle: String,
      metaDescription: String,
      canonicalUrl: String,
    },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
