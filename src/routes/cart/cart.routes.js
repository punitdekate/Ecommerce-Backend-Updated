import express from "express";
import CartController from "../../controllers/cart/cart.controller.js";

const cartRouter = express.Router();

const cartController = new CartController();
cartRouter.get("/", (req, res, next) => {
  cartController.getUserCart(req, res, next);
});

cartRouter.post("/:productId", (req, res, next) => {
  cartController.addToUserCart(req, res, next);
});

cartRouter.delete("/:productId", (req, res, next) => {
  cartController.deleteProductFromUserCart(req, res, next);
});

cartRouter.put("/:productId", (req, res, next) => {
  cartController.updateCartProduct(req, res, next);
});

export default cartRouter;
