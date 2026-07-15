const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { createProductValidator } = require("../validators/productValidators");
const validate = require("../middleware/validateMiddleware");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  protect,
  authorize("admin"),
  createProductValidator,
  validate,
  createProduct,
);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
