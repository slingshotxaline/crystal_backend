const mongoose = require('mongoose');

/**
 * Approved downloadable documents (brochures, capability statements,
 * compliance certificates). File binaries live in object storage;
 * this record stores metadata and the approval gate.
 */
const DocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileSizeKb: { type: Number },
    isApproved: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
