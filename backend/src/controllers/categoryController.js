const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Category = require("../models/Category");

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().populate("parent").sort("name");
  res.status(200).json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = payload.slug || slugify(payload.name);

  const category = await Category.create(payload);
  res
    .status(201)
    .json({ success: true, message: "Category created", data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (payload.name && !payload.slug) {
    payload.slug = slugify(payload.name);
  }

  const category = await Category.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res
    .status(200)
    .json({ success: true, message: "Category updated", data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json({ success: true, message: "Category deleted" });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
