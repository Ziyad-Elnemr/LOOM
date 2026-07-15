const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createOrderValidator,
  updateOrderStatusValidator,
} = require("../validators/orderValidators");
const validate = require("../middleware/validateMiddleware");

router.post("/", protect, createOrderValidator, validate, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, authorize("admin"), getAllOrders);
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  updateOrderStatusValidator,
  validate,
  updateOrderStatus,
);

module.exports = router;
