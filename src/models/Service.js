const mongoose = require("mongoose");

/**
 * Service pages: Air Freight, Ocean Freight, Multimodal Logistics,
 * Inland Transport & Customs, Project Logistics, Contract Logistics,
 * Value Added Service & GOH, Warehousing & Container.
 *
 * Shape mirrors frontend/src/data/services.js exactly, so content
 * seeded or edited here is a drop-in replacement for that static file
 * once the site is switched over to fetch('/api/cms/services/public').
 *
 * related* are stored as plain {label, slug} pairs rather than
 * populated ObjectId refs — this keeps the admin form simple (no
 * dropdown needs to be kept in sync with another collection) and
 * matches exactly how the frontend already consumes this data.
 */
const FaqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
  },
  { _id: false },
);

const RelatedItemSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    slug: { type: String, trim: true },
  },
  { _id: false },
);

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: { type: String, trim: true }, // key into the frontend Icon component, e.g. 'plane'
    category: { type: String, trim: true }, // display eyebrow, e.g. "AIR FREIGHT"
    tagline: { type: String, trim: true }, // short line shown on the overview card
    cardDescription: { type: String, trim: true }, // longer line shown on the overview card
    headline: { type: String, trim: true }, // H1 on the detail page hero
    subhead: { type: String, trim: true },
    primaryCta: { type: String, trim: true },
    secondaryCta: { type: String, trim: true },
    controls: [{ type: String }], // "what this helps you control" tags
    capabilities: [{ type: String }],
    supportSteps: [{ type: String }], // "how we support the shipment" numbered steps
    proofNote: { type: String, trim: true },
    faqs: [FaqSchema],
    relatedServices: [RelatedItemSchema],
    relatedIndustries: [RelatedItemSchema],
    caseStudy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaseStudy",
      default: null,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      canonicalUrl: String,
    },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Service", ServiceSchema);
