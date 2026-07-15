const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

const simulateFakePayment = () => {
  const success = Math.random() > 0.05;
  return {
    success,
    transactionId: `FAKE-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
  };
};

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let itemsTotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product || !product.isActive) {
      throw new ApiError(
        400,
        `Product no longer available: ${item.product.title}`,
      );
    }

    const price = product.price;
    itemsTotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.image,
      quantity: item.quantity,
      price,
    });
  }

  const shippingFee = itemsTotal > 100 ? 0 : 9.99;
  const totalAmount = itemsTotal + shippingFee;
  const paymentResult = simulateFakePayment();

  if (!paymentResult.success) {
    throw new ApiError(402, "Payment failed (simulated). Please try again.");
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsTotal,
    shippingFee,
    totalAmount,
    payment: {
      method: paymentMethod || "fake_card",
      status: "paid",
      transactionId: paymentResult.transactionId,
      paidAt: new Date(),
    },
  });

  cart.items = [];
  await cart.save();

  res
    .status(201)
    .json({ success: true, message: "Order placed successfully", data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort("-createdAt");
  res.status(200).json({ success: true, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = orderStatus;
  await order.save();

  res
    .status(200)
    .json({ success: true, message: "Order status updated", data: order });
});

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
