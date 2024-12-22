import { body, validationResult } from "express-validator";

export const validateUser = async (req, res, next) => {
  const rules = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password should be greater than 8 characters"),
    body("password")
      .isLength({ max: 16 })
      .withMessage("Password should be not be more than 16 characters"),
    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["seller", "customer"])
      .withMessage("Role must be either 'seller' or 'customer'"),
  ];

  await Promise.all(rules.map((rule) => rule.run(req)));

  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array();
    res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};
