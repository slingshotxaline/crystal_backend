const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the Bearer JWT and attaches the authenticated user to req.user.
 * Tokens issued before the user's last password change are rejected.
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Account not found or inactive." });
    }

    if (
      user.passwordChangedAt &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Password was changed. Please log in again.",
        });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session." });
  }
}

/**
 * Restricts a route to the given roles, e.g. restrictTo('admin').
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You do not have permission to do this.",
        });
    }
    next();
  };
}

module.exports = { protect, restrictTo };
