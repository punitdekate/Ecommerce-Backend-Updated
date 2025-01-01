import { body, validationResult } from "express-validator";

export const validateProduct = async (req, res, next) => {
  const rules = [
    body("title").notEmpty().withMessage("Product title is required"),
    body("title")
      .isLength({ min: 3 })
      .withMessage("Product title must be at least 3 characters long."),
    body("title")
      .isLength({ max: 100 })
      .withMessage("Product title cannot exceed 100 characters."),

    body("description")
      .notEmpty()
      .withMessage("Product description is required."),
    body("description")
      .isLength({ min: 10 })
      .withMessage("Product description must be at least 10 characters long."),
    body("description")
      .isLength({ max: 1000 })
      .withMessage("Product description cannot exceed 1000 characters."),

    body("price").notEmpty().withMessage("Price is required."),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("stock")
      .notEmpty()
      .withMessage("Stock quantity is required.")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer."),

    body("category")
      .notEmpty()
      .withMessage("Product category is required.")
      .isString()
      .withMessage("Category must be a string."),
  ];

  await Promise.all(rules.map((rule) => rule.run(req)));

  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array();
    return res.status(400).json({ success: false, error: errors[0].msg });
  }
  next();
};
