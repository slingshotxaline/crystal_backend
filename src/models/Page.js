const mongoose = require('mongoose');

/**
 * Generic flexible page for CMS-managed static/marketing pages
 * (e.g. About, Leadership, Group Ecosystem) that don't need a
 * dedicated schema of their own. `sections` holds ordered,
 * loosely-typed content blocks the admin panel can rearrange.
 */
const SectionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g. "hero", "richText", "stats", "gallery"
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sections: [SectionSchema],
    seo: {
      metaTitle: String,
      metaDescription: String,
      canonicalUrl: String,
    },
    isPublished: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', PageSchema);
