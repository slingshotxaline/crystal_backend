const mongoose = require('mongoose');

/**
 * Request a Quote submissions.
 * Fields mirror the brief: Mode, Direction, Origin, Destination, Cargo,
 * Commodity, Pieces, Weight, Volume, Dimensions, Ready Date,
 * Delivery Requirement, Company, Contact Details.
 */
const QuoteSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ['air', 'ocean', 'multimodal', 'inland', 'project', 'not_sure'],
      required: [true, 'Mode of transport is required'],
    },
    direction: {
      type: String,
      enum: ['import', 'export', 'domestic'],
      required: [true, 'Direction is required'],
    },
    origin: { type: String, required: [true, 'Origin is required'], trim: true },
    destination: { type: String, required: [true, 'Destination is required'], trim: true },
    cargoType: { type: String, trim: true },
    commodity: { type: String, required: [true, 'Commodity is required'], trim: true },
    pieces: { type: Number, min: 0 },
    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
    },
    volume: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['cbm', 'cft'], default: 'cbm' },
    },
    dimensions: { type: String, trim: true },
    readyDate: { type: Date },
    deliveryRequirement: { type: String, trim: true },
    company: { type: String, required: [true, 'Company name is required'], trim: true },
    contactName: { type: String, required: [true, 'Contact name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], trim: true, lowercase: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    privacyConsent: { type: Boolean, required: true },

    // Origin of the enquiry to help distinguish contextual forms
    source: {
      type: String,
      enum: ['general_quote', 'fashion_logistics', 'project_cargo'],
      default: 'general_quote',
    },

    status: {
      type: String,
      enum: ['new', 'in_review', 'quoted', 'won', 'lost', 'spam'],
      default: 'new',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referenceCode: { type: String, unique: true },

    // Anti-spam / audit
    ipAddress: { type: String },
    userAgent: { type: String },
    honeypot: { type: String, select: false },
  },
  { timestamps: true }
);

QuoteSchema.pre('validate', function generateReference(next) {
  if (!this.referenceCode) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.referenceCode = `CEL-Q-${stamp}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Quote', QuoteSchema);
