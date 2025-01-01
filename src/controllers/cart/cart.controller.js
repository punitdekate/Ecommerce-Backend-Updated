import {
  INTERNAL_SERVER_ERROR,
  OPERATION_IS_REQUIRED,
  PRODUCT_ID_IS_REQUIRED,
} from "../../config/constants.js";
import CartRepository from "../../repositories/cart/cart.repository.js";
import { CustomApplicationError } from "../../utility/errorhandlers/custom.errorhandler.js";
import logger from "../../utility/errorhandlers/logger.js";

export default class CartController {
  constructor() {
    this.cartRepository = new CartRepository();
  }

  /** Get user cart */
  async getUserCart(req, res, next) {
    try {
      logger.info("----------Start GetUserCart----------");

      const userId = req.user.id;
      logger.info(`User Id : ${userId}`);

      const dbResponse = await this.cartRepository.getByUserId(userId);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End GetUserCart----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  /** add product to user cart */
  async addToUserCart(req, res, next) {
    try {
      logger.info("----------Start AddToUserCart----------");
      
      const userId = req.user.id;
      const productId = req.params.productId;
      logger.info(`User Id : ${userId}, Product Id : ${productId}`);
      if (!productId.trim()) {
        throw CustomApplicationError(PRODUCT_ID_IS_REQUIRED, 400);
      }
      const dbResponse = await this.cartRepository.add(productId, userId);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End AddToUserCart----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  /** remove product from the user cart */
  async deleteProductFromUserCart(req, res, next) {
    try {
      logger.info("----------Start DeleteProductFromUserCart----------");

      const userId = req.user.id;
      const productId = req.params.productId;
      if (!productId) {
        throw CustomApplicationError(PRODUCT_ID_IS_REQUIRED, 400);
      }
      logger.info(`User Id : ${userId}, Product Id : ${productId}`);

      const dbResponse = await this.cartRepository.removeProductFromCart(
        productId,
        userId
      );
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End DeleteProductFromUserCart----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  /** update the cart product e.g. count of product */
  async updateCartProduct(req, res, next) {
    try {
      logger.info("----------Start UpdateCartProduct----------");

      const productId = req.params.productId;
      const userId = req.user.id;
      const { op } = req.query;

      logger.info(
        `User Id : ${userId}, Product Id : ${productId}, Operation : ${op}`
      );
      if (!op) {
        throw new CustomApplicationError(OPERATION_IS_REQUIRED, 400);
      }
      const dbResponse = await this.cartRepository.updateCartQuantity(
        productId,
        userId,
        op
      );
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End UpdateCartProduct----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }
}
