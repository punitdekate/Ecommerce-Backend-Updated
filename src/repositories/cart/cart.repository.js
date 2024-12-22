import {
  CART_NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  PRODUCT_NOT_EXIST,
  PRODUCT_QUANTITY_NOT_LESS_THAT_ONE,
} from "../../config/constants.js";
import CartModel from "../../schemas/cart.schema.js";
import { CustomMongooseError } from "../../utility/errorhandlers/custom.errorhandler.js";

export default class CartRepository {
  async getByUserId(id) {
    try {
      const cartData = await CartModel.findOne({ user: id });
      return { success: true, data: cartData ? cartData : [] };
    } catch (error) {
      throw error;
    }
  }

  async add(productId, userId) {
    try {
      //check cart for user exists already
      const cartExists = await CartModel.findOne({ user: userId });
      let updatedCart;
      if (cartExists) {
        //check product is already in the cart.
        let productIndex = cartExists.products.findIndex(
          (product) => product.productId.toString() === productId
        );
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
      return { success: true, data: updatedCart };
    } catch (error) {
      throw error;
    }
  }

  async removeProductFromCart(productId, userId) {
    try {
      //check is there cart
      const cartExists = await CartModel.findOne({ user: userId });
      if (!cartExists) {
        throw new CustomMongooseError(CART_NOT_FOUND, 200);
      }
      let productExistsIndex = cartExists.products.findIndex(
        (ele) => ele.productId.toString() === productId
      );
      if (productExistsIndex < 0) {
        throw new CustomMongooseError(PRODUCT_NOT_EXIST, 400);
      }
      cartExists.products.splice(productExistsIndex, 1);
      const updatedCart = await cartExists.save();
      return { success: true, data: updatedCart };
    } catch (error) {
      throw error;
    }
  }

  async updateCartQuantity(productId, userId, op) {
    try {
      //check is there cart
      const cartExists = await CartModel.findOne({ user: userId });
      if (!cartExists) {
        throw new CustomMongooseError(CART_NOT_FOUND, 200);
      }
      let productExistsIndex = cartExists.products.findIndex(
        (ele) => ele.productId.toString() === productId
      );
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
      return { success: true, data: updatedCart };
    } catch (error) {
      throw error;
    }
  }
}
