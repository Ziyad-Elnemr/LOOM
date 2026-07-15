const { body } = require("express-validator");

const createProductValidator = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 220 })
    .withMessage("Title must be 2-220 characters"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("category").notEmpty().withMessage("Category is required"),
  body("image").isURL().withMessage("Image must be a valid URL"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("rating.rate")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating rate must be between 0 and 5"),
  body("rating.count")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Rating count must be a positive integer"),
];

module.exports = { createProductValidator };
