const mongoose = require('mongoose');

const IndustrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, trim: true },
    heroHeadline: { type: String, trim: true },
    considerations: [{ type: String }], // e.g. "Replenishment timing, product condition..."
    relatedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    caseStudy: { type: mongoose.Schema.Types.ObjectId, ref: 'CaseStudy', default: null },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Industry', IndustrySchema);
