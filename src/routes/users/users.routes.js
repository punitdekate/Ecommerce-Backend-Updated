import express from "express";
import UserController from "../../controllers/users/users.controller.js";
import { validateUser } from "../../middlewares/users/users.middleware.js";
import { auth } from "../../middlewares/users/auth.middleware.js";
import { profileUpload } from "../../middlewares/users/profileupload.middleware.js";
import { validateResetUserPassword } from "../../middlewares/users/reset.middleware.js";
const userController = new UserController();
const userRouter = express.Router();

userRouter.post("/generateToken", (req, res, next) => {
  userController.generateToken(req, res, next);
});

userRouter.get("/", auth, (req, res, next) => {
  userController.getAllUsers(req, res, next);
});
userRouter.post(
  "/",
  validateUser,
  profileUpload.single("profile"),
  (req, res, next) => {
    userController.createUser(req, res, next);
  }
);

userRouter.get("/:id", auth, (req, res, next) => {
  userController.getUser(req, res, next);
});

userRouter.put(
  "/:id",
  auth,
  profileUpload.single("profile"),
  (req, res, next) => {
    userController.modifyUser(req, res, next);
  }
);

userRouter.get("/:id", auth, (req, res, next) => {
  userController.deleteUser(req, res, next);
});

userRouter.post(
  "/resetPassword",
  validateResetUserPassword,
  (req, res, next) => {
    userController.resetUserPassword(req, res, next);
  }
);

userRouter.delete("/:id", auth, (req, res, next) => {
  userController.deleteUser(req, res, next);
});
export default userRouter;
