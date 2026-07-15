const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Review = require("../models/Review");
const Product = require("../models/Product");

const recalcProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = stats[0] || { avgRating: 0, count: 0 };
  await Product.findByIdAndUpdate(productId, {
    rating: {
      rate: summary.avgRating || 0,
      count: summary.count || 0,
    },
  });
};

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).populate(
    "user",
    "name",
  );
  res.status(200).json({ success: true, data: reviews });
});

const createOrUpdateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const review = await Review.findOneAndUpdate(
    { product: productId, user: req.user._id },
    { rating, comment },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  await recalcProductRating(productId);

  res
    .status(201)
    .json({ success: true, message: "Review saved", data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You do not have permission to delete this review");
  }

  await review.deleteOne();
  await recalcProductRating(review.product);

  res.status(200).json({ success: true, message: "Review deleted" });
});

module.exports = { getProductReviews, createOrUpdateReview, deleteReview };
