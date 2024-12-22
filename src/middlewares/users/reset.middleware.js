import { body, validationResult } from "express-validator";

export const validateResetUserPassword = async (req, res, next) => {
  const rules = [
    body("email").notEmpty().withMessage("Email is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("oldPassword").notEmpty().withMessage("Old Password is required"),
    body("newPassword").notEmpty().withMessage("Password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New Password should be greater than 8 characters"),
    body("newPassword")
      .isLength({ max: 16 })
      .withMessage("New Password should be not be more than 16 characters"),
  ];

  await Promise.all(rules.map((rule) => rule.run(req)));

  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array();
    res.status(400).json({ success: false, error: errors[0] });
  }
  next();
};
