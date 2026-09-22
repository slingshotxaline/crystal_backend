const mongoose = require('mongoose');

/**
 * Network map entries. `relationship` classifies ownership per the brief's
 * requirement that owned operations, joint ventures, group entities and
 * partners must stay visually distinct.
 */
const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Dhaka Head Office"
    country: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    relationship: {
      type: String,
      enum: ['crystal_office', 'joint_venture', 'regional_group_operation', 'network_partner'],
      required: true,
    },
    address: { type: String, trim: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    servicesOffered: [{ type: String }],
    isVerified: { type: Boolean, default: false }, // gates public display of sensitive claims
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', LocationSchema);
