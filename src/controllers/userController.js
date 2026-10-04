const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const ROLES = ["admin", "editor", "viewer"];

/** Never let the system end up with zero active admins. */
async function otherActiveAdminExists(excludeId) {
  const count = await User.countDocuments({
    role: "admin",
    isActive: true,
    _id: { $ne: excludeId },
  });
  return count > 0;
}

/** GET /api/users */
exports.listUsers = catchAsync(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

/** POST /api/users — admin creates a new CMS user. */
exports.createUser = catchAsync(async (req, res) => {
  const { name, email, password, role = "editor" } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Name, email and password are required.",
      });
  }
  if (String(password).length < 8) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role." });
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) {
    return res
      .status(409)
      .json({
        success: false,
        message: "A user with this email already exists.",
      });
  }

  const user = await User.create({ name, email, password, role });
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
});

/** PATCH /api/users/:id — update name, email, role, active status. */
exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found." });

  const { name, email, role, isActive } = req.body;
  const isSelf = String(user._id) === String(req.user._id);

  if (role !== undefined) {
    if (!ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }
    if (isSelf && role !== user.role) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot change your own role." });
    }
    if (
      user.role === "admin" &&
      role !== "admin" &&
      !(await otherActiveAdminExists(user._id))
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one active admin is required.",
        });
    }
    user.role = role;
  }

  if (isActive !== undefined) {
    if (isSelf && isActive === false) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot deactivate your own account.",
        });
    }
    if (
      user.role === "admin" &&
      isActive === false &&
      !(await otherActiveAdminExists(user._id))
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one active admin is required.",
        });
    }
    user.isActive = Boolean(isActive);
  }

  if (name !== undefined) user.name = name;
  if (email !== undefined) {
    const taken = await User.findOne({
      email: String(email).toLowerCase(),
      _id: { $ne: user._id },
    });
    if (taken) {
      return res
        .status(409)
        .json({
          success: false,
          message: "A user with this email already exists.",
        });
    }
    user.email = email;
  }

  await user.save();
  res.json({ success: true, data: user });
});

/** PATCH /api/users/:id/password — admin resets another user's password. */
exports.resetPassword = catchAsync(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 8) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
  }

  const user = await User.findById(req.params.id).select("+password");
  if (!user)
    return res.status(404).json({ success: false, message: "User not found." });

  user.password = newPassword;
  await user.save();
  res.json({
    success: true,
    message: "Password reset. The user must log in again.",
  });
});

/** DELETE /api/users/:id */
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found." });

  if (String(user._id) === String(req.user._id)) {
    return res
      .status(400)
      .json({ success: false, message: "You cannot delete your own account." });
  }
  if (
    user.role === "admin" &&
    user.isActive &&
    !(await otherActiveAdminExists(user._id))
  ) {
    return res
      .status(400)
      .json({
        success: false,
        message: "At least one active admin is required.",
      });
  }

  await user.deleteOne();
  res.json({ success: true, message: "User deleted." });
});
