import { EMPTY_CART } from "../../config/constants.js";
import OrderModel from "../../schemas/orders.schema.js";
import { CustomMongooseError } from "../../utility/errorhandlers/custom.errorhandler.js";
import logger from "../../utility/errorhandlers/logger.js";

export default class OrdersRepository {
  async getAllOrders(userId) {
    try {
      logger.info("----------Start Repo GetAllOrders----------");

      const orders = await OrderModel.find({ user: userId }).populate({
        path: "products.productId", // Assuming 'products' is the field in CartModel
        model: "Product", // Replace 'Product' with the actual name of your product model
      });

      logger.info("----------End Repo GetAllOrders----------");
      return { success: true, data: orders };
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      logger.info("----------Start Repo GetAllOrders----------");

      const order = await OrderModel.findById(orderId);

      logger.info("----------End Repo GetAllOrders----------");

      return { success: true, data: order };
    } catch (error) {
      throw error;
    }
  }

  async update(orderId, data) {
    try {
      logger.info("----------Start Repo UpdateOrder----------");

      const order = await OrderModel.findByIdAndUpdate(
        { _id: orderId },
        {
          $set: data,
        },
        { new: true, runValidators: true }
      );
      logger.info("----------End Repo UpdateOrder----------");
      return { success: true, data: order };
    } catch (error) {
      throw new CustomMongooseError(error.message, 500);
    }
  }

  async delete(orderId) {
    try {
      logger.info("----------Start Repo DeleteOrder----------");
      const orderDeleted = await OrderModel.findByIdAndDelete(orderId);
      logger.info("----------End Repo DeleteOrder----------");
      return { success: true, data: {} };
    } catch (error) {
      throw new CustomMongooseError(error.message, 500);
    }
  }

  async addOrders(userId, userCart) {
    try {
      logger.info("----------Start Repo AddOrder----------");
      logger.info(
        `User Id : ${userId}, User Cart : ${JSON.stringify(userCart)}`
      );
      if (userCart?.data?.products?.length > 0) {
        const orderToBePlaced = new OrderModel({
          user: userId,
          products: userCart.data.products.map((ele) => ({
            productId: ele.productId._id,
            quantity: ele.quantity,
            price: ele.productId.price,
          })),
          totalPrice: userCart.data.products.reduce(
            (acc, currentValue) =>
              acc +
              parseFloat(currentValue.productId.price) *
                parseFloat(currentValue.quantity),
            0
          ),
          status: "pending",
        });
        await orderToBePlaced.save();
        logger.info("----------End Repo AddeOrder----------");

        return { success: true, data: orderToBePlaced };
      } else {
        throw new CustomMongooseError(EMPTY_CART, 400);
      }
    } catch (error) {
      throw error;
    }
  }
}
