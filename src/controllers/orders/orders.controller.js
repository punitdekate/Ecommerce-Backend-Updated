import OrdersRepository from "../../repositories/orders/orders.repository.js";
import logger from "../../utility/errorhandlers/logger.js";
import CartRepository from "../../repositories/cart/cart.repository.js";

export default class OrdersController {
  constructor() {
    this.orderRepository = new OrdersRepository();
    this.cartRepository = new CartRepository();
  }

  async getUserOrders(req, res, next) {
    try {
      logger.info("----------Start GetUserOrders----------");
      const userId = req.user.id;
      logger.info(`User Id : ${userId}`);

      const dbResponse = await this.orderRepository.getAllOrders(userId);
      logger.info("----------End GetUserOrders----------");
      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async placeOrder(req, res, next) {
    try {
      logger.info("----------Start PlaceOrder----------");
      const userId = req.user.id;

      logger.info(`User Id : ${userId}`);

      /** Getting user cart */
      const userCart = await this.cartRepository.getByUserId(userId);
      /**Calling db to add orders */
      const dbResponse = await this.orderRepository.addOrders(userId, userCart);
      /**After placing order deleting the cart */
      await this.cartRepository.deleteUserCart(userId);

      logger.info("----------End PlaceOrder----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }
}
