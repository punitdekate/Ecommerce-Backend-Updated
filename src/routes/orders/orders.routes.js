import express from "express";
import OrdersController from "../../controllers/orders/orders.controller.js";

const ordersRouter = express.Router();
const orderController = new OrdersController();

const ordersController = new OrdersController();
ordersRouter.get("/", (req, res, next) => {
  ordersController.getUserOrders(req, res, next);
});

ordersRouter.post("/", (req, res, next) => {
  ordersController.placeOrder(req, res, next);
});

ordersRouter.delete("/:orderId", (req, res, next) => {
  ordersController.deleteOrder(req, res, next);
});

ordersRouter.put("/:orderId", (req, res, next) => {
  ordersController.updateOrder(req, res, next);
});

export default ordersRouter;
