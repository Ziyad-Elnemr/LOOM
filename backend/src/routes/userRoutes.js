const express = require("express");
const router = express.Router();
const {
  getMe,
  updateMe,
  getAllUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.get("/", protect, authorize("admin"), getAllUsers);
router.patch("/:id/status", protect, authorize("admin"), updateUserStatus);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
