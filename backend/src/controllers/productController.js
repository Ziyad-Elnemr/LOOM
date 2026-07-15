const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Product = require("../models/Product");

const normalizeProduct = (product) => {
  const productJson = product.toObject({ virtuals: true });
  const imageFromLegacyImages = productJson.images?.[0]?.url;

  return {
    id: productJson.id || productJson._id.toString(),
    title: productJson.title || productJson.name || "Untitled product",
    description: productJson.description || "",
    category:
      typeof productJson.category === "string"
        ? productJson.category
        : productJson.category?.name ||
          productJson.category?.title ||
          "uncategorized",
    image: productJson.image || imageFromLegacyImages || "",
    price: productJson.price || 0,
    rating:
      typeof productJson.rating === "number"
        ? { rate: productJson.rating, count: productJson.numReviews || 0 }
        : {
            rate: productJson.rating?.rate || 0,
            count: productJson.rating?.count || 0,
          },
  };
};

const getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const filter = {
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    filter.category = category;
  }

  const products = await Product.find(filter).sort("-createdAt");
  res.status(200).json({ success: true, data: products.map(normalizeProduct) });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({ success: true, data: normalizeProduct(product) });
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    image: req.body.image,
    price: req.body.price,
    rating: req.body.rating || { rate: 0, count: 0 },
    isActive: req.body.isActive ?? true,
  };
  payload.createdBy = req.user._id;

  const product = await Product.create(payload);
  res
    .status(201)
    .json({ success: true, message: "Product created", data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json({ success: true, message: "Product updated", data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res
    .status(200)
    .json({ success: true, message: "Product removed", data: product });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
