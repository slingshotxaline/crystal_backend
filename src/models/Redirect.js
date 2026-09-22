const mongoose = require('mongoose');

const RedirectSchema = new mongoose.Schema(
  {
    fromPath: { type: String, required: true, unique: true, trim: true },
    toPath: { type: String, required: true, trim: true },
    statusCode: { type: Number, enum: [301, 302], default: 301 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Redirect', RedirectSchema);
