const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
  );
  res
    .status(200)
    .json({ success: true, data: cart || { user: req.user._id, items: [] } });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  const cart =
    (await Cart.findOne({ user: req.user._id })) ||
    (await Cart.create({ user: req.user._id, items: [] }));
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
    });
  }

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate("items.product");
  res
    .status(200)
    .json({ success: true, message: "Cart updated", data: populatedCart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    throw new ApiError(404, "Cart item not found");
  }

  item.quantity = quantity;
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate("items.product");
  res
    .status(200)
    .json({ success: true, message: "Cart item updated", data: populatedCart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items.pull(req.params.itemId);
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate("items.product");
  res
    .status(200)
    .json({ success: true, message: "Cart item removed", data: populatedCart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  await cart.save();
  res.status(200).json({ success: true, message: "Cart cleared" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
