const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "addresses"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res
    .status(200)
    .json({ success: true, message: "Profile updated", data: user });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt");
  res.status(200).json({ success: true, data: users });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (typeof isActive === "boolean") {
    user.isActive = isActive;
  }

  if (role) {
    user.role = role;
  }

  await user.save();
  res.status(200).json({ success: true, message: "User updated", data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // Delete user from base
  await user.deleteOne();
  res.status(200).json({ success: true, message: "User removed successfully" });
});

module.exports = { getMe, updateMe, getAllUsers, updateUserStatus, deleteUser };
