const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * CMS users. Role-based access: admin (full control),
 * editor (content only), viewer (read-only dashboard access).
 */
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "editor",
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    // Tokens issued before this moment are rejected (see middleware/auth.js).
    passwordChangedAt: { type: Date },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
