const mongoose = require("mongoose");

const IndustrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: { type: String, trim: true },
    heroHeadline: { type: String, trim: true },
    considerations: [{ type: String }], // e.g. "Replenishment timing, product condition..."
    // Plain service slugs (not {label, slug} pairs) — matches
    // frontend/src/data/industries.js exactly. IndustryTemplate looks
    // each one up via getServiceBySlug() to render the icon/title/tagline,
    // so keeping this a simple string array avoids two copies of the
    // service label getting out of sync with each other.
    relatedServices: [{ type: String }],
    caseStudy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaseStudy",
      default: null,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
    isPublished: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Industry", IndustrySchema);
