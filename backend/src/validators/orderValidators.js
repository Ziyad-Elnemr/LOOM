const { body } = require("express-validator");

const createOrderValidator = [
  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street is required"),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("shippingAddress.postalCode")
    .trim()
    .notEmpty()
    .withMessage("Postal code is required"),
  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
];

const updateOrderStatusValidator = [
  body("orderStatus")
    .isIn(["processing", "shipped", "delivered", "cancelled"])
    .withMessage("Invalid order status"),
];

module.exports = { createOrderValidator, updateOrderStatusValidator };
