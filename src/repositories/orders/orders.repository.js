import OrderModel from "../../schemas/orders.schema.js";
import { CustomMongooseError } from "../../utility/errorhandlers/custom.errorhandler.js";

export default class OrdersRepository {
  async getAllOrders(userId) {
    try {
      const orders = await OrderModel.find({ user: userId });
      return { success: true, data: orders };
    } catch (error) {
      throw new CustomMongooseError(error.message, 500);
    }
  }

  async getOrderById(orderId) {
    try {
      const order = await OrderModel.findById(orderId);
      return { success: true, data: order };
    } catch (error) {
      throw new CustomMongooseError(error.message, 500);
    }
  }

  async update(orderId, data) {
    try {
      const order = await OrderModel.findByIdAndUpdate(
        { _id: orderId },
        {
          $set: data,
        },
        { new: true, runValidators: true }
      );
      return { success: true, data: order };
    } catch (error) {
      throw new CustomMongooseError(error.message, 500);
    }
  }

  async delete(orderId) {
    try {
      const orderDeleted = await OrderModel.findByIdAndDelete(orderId);
      return { success: true, data: {} };
    } catch (error) {
      throw new CustomMongooseError(error.message, 500);
    }
  }
}
