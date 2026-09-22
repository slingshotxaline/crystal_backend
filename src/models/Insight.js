const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      enum: ['bangladesh_gateway', 'air_ocean_market', 'multimodal_routing', 'fashion_consolidation'],
      required: true,
    },
    excerpt: { type: String, trim: true },
    body: { type: String }, // rich text / markdown
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editorialApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    publishedAt: { type: Date },
    isPublished: { type: Boolean, default: false },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Insight', InsightSchema);
