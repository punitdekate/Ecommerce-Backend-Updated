import mongoose from "mongoose";

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User id is required."],
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: [true, "At least one product ID should be present."],
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1."],
        },
      },
    ],
  },
  { timestamp: true }
);

const CartModel = new mongoose.model("Cart", cartSchema);
export default CartModel;
