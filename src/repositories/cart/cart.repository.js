import {
  CART_NOT_FOUND,
  PRODUCT_NOT_EXIST,
  PRODUCT_QUANTITY_NOT_LESS_THAT_ONE,
} from "../../config/constants.js";
import CartModel from "../../schemas/cart.schema.js";
import { CustomMongooseError } from "../../utility/errorhandlers/custom.errorhandler.js";
import logger from "../../utility/errorhandlers/logger.js";

export default class CartRepository {
  async getByUserId(id) {
    try {
      logger.info("----------Start Cart Repo GetUserById----------");
      const cartData = await CartModel.findOne({ user: id }).populate({
        path: "products.productId", // Assuming 'products' is the field in CartModel
        model: "Product", // Replace 'Product' with the actual name of your product model
      });
      logger.info("----------End Cart Repo GetUserById----------");
      return { success: true, data: cartData ? cartData : {} };
    } catch (error) {
      throw error;
    }
  }

  async add(productId, userId) {
    try {
      logger.info("----------Start Cart Repo GetUserById----------");
      const cartExists = await CartModel.findOne({ user: userId });
      logger.info(`Cart Exists : ${cartExists}`);

      let updatedCart;
      if (cartExists) {
        //check product is already in the cart.
        let productIndex = cartExists.products.findIndex(
          (product) => product.productId.toString() === productId
        );
        logger.info(`Product Index : ${productIndex}`);
        if (productIndex >= 0) {
          throw new CustomMongooseError(
            "Product is already added into the cart",
            400
          );
        } else {
          cartExists.products.push({
            productId: productId,
          });
        }
        updatedCart = await cartExists.save();
      } else {
        const cartItem = {
          user: userId,
          products: [
            {
              productId: productId,
            },
          ],
        };
        updatedCart = await new CartModel(cartItem);
        await updatedCart.save();
      }
      logger.info(`Updated Cart : ${updatedCart}`);
      return { success: true, data: updatedCart };
    } catch (error) {
      throw error;
    }
  }

  async removeProductFromCart(productId, userId) {
    try {
      //check is there cart
      logger.info("----------Start Cart Repo RemoveProductFromCart----------");
      const cartExists = await CartModel.findOne({ user: userId });
      logger.info(`Cart Exists : ${cartExists}`);
      if (!cartExists) {
        throw new CustomMongooseError(CART_NOT_FOUND, 200);
      }
      let productExistsIndex = cartExists.products.findIndex(
        (ele) => ele.productId.toString() === productId
      );
      logger.info(`Product Exists Index : ${productExistsIndex}`);
      if (productExistsIndex < 0) {
        throw new CustomMongooseError(PRODUCT_NOT_EXIST, 400);
      }
      cartExists.products.splice(productExistsIndex, 1);
      const updatedCart = await cartExists.save();
      logger.info(`Updated Cart : ${updatedCart}`);
      logger.info("----------End Cart Repo RemoveProductFromCart----------");
      return { success: true, data: updatedCart };
    } catch (error) {
      throw error;
    }
  }

  async updateCartQuantity(productId, userId, op) {
    try {
      logger.info("----------Start Cart Repo UpdateCartQuantity----------");
      const cartExists = await CartModel.findOne({ user: userId });
      logger.info(`Cart Exists : ${cartExists}`);
      if (!cartExists) {
        throw new CustomMongooseError(CART_NOT_FOUND, 200);
      }
      let productExistsIndex = cartExists.products.findIndex(
        (ele) => ele.productId.toString() === productId
      );
      logger.info(`Product Exists Index : ${productExistsIndex}`);
      if (productExistsIndex < 0) {
        throw new CustomMongooseError(PRODUCT_NOT_EXIST, 400);
      }
      if (op === "inc") {
        cartExists.products[productExistsIndex].quantity += 1;
      } else if (op === "dec") {
        if (cartExists.products[productExistsIndex].quantity > 1) {
          cartExists.products[productExistsIndex].quantity -= 1;
        } else {
          throw new CustomMongooseError(
            PRODUCT_QUANTITY_NOT_LESS_THAT_ONE,
            400
          );
        }
      }
      const updatedCart = await cartExists.save();
      logger.info(`Updated Cart : ${updatedCart}`);
      logger.info("----------End Cart Repo UpdateCartQuantity----------");
      return { success: true, data: updatedCart };
    } catch (error) {
      throw error;
    }
  }

  async deleteUserCart(userId) {
    try {
      logger.info("----------Start Cart Repo DeleteUserCart----------");
      const deletedProduct = await CartModel.findOneAndDelete({ user: userId });
      if (deletedProduct) {
        logger.info(`Deleted Product : ${deletedProduct}`);
      } else {
        throw new CustomMongooseError(CART_NOT_FOUND, 200);
      }
      logger.info("----------End Cart Repo DeleteUserCart----------");
    } catch (error) {
      throw error;
    }
  }
}
