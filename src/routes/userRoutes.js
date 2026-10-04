const express = require("express");
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Admin only: manage CMS users and roles.
router.use(protect, restrictTo("admin"));

router.route("/").get(userController.listUsers).post(userController.createUser);
router
  .route("/:id")
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
router.patch("/:id/password", userController.resetPassword);

module.exports = router;
