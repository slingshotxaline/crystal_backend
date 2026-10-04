const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

/**
 * POST /api/auth/login — CMS login (admin/editor/viewer).
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  const user = await User.findOne({
    email: String(email).toLowerCase(),
  }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Incorrect email or password." });
  }
  if (!user.isActive) {
    return res
      .status(403)
      .json({ success: false, message: "This account has been deactivated." });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

/**
 * GET /api/auth/me — returns the logged-in CMS user.
 */
exports.me = catchAsync(async (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * PATCH /api/auth/change-password — any logged-in user changes their own
 * password. Requires the current password. Returns a fresh token because
 * older tokens are invalidated by the password change.
 */
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Current and new password are required.",
      });
  }
  if (String(newPassword).length < 8) {
    return res
      .status(400)
      .json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
  }
  if (currentPassword === newPassword) {
    return res
      .status(400)
      .json({
        success: false,
        message: "New password must differ from the current one.",
      });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return res
      .status(401)
      .json({ success: false, message: "Current password is incorrect." });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password updated.",
    token: signToken(user._id),
  });
});
