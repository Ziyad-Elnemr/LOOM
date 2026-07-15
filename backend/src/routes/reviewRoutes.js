const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  createOrUpdateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, createOrUpdateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
