const mongoose = require('mongoose');

/**
 * Generic enquiry model reused for: General Contact, Partnership,
 * and Careers/Job Application submissions. The `type` field routes
 * the enquiry to the correct responsible team (see enquiryController).
 */
const EnquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['general', 'partnership', 'careers'],
      required: true,
    },
    fullName: { type: String, required: [true, 'Name is required'], trim: true },
    company: { type: String, trim: true },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 3000 },

    // Partnership-specific
    partnershipRegion: { type: String, trim: true },
    partnershipType: {
      type: String,
      enum: ['overseas_agent', 'joint_venture', 'network_membership', 'other'],
    },

    // Careers-specific
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    resumeUrl: { type: String, trim: true },

    privacyConsent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ['new', 'in_review', 'responded', 'closed', 'spam'],
      default: 'new',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referenceCode: { type: String, unique: true },

    ipAddress: { type: String },
    userAgent: { type: String },
    honeypot: { type: String, select: false },
  },
  { timestamps: true }
);

EnquirySchema.pre('validate', function generateReference(next) {
  if (!this.referenceCode) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.referenceCode = `CEL-E-${stamp}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
