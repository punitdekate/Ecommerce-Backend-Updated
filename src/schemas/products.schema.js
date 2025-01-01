import mongoose from "mongoose";
import CartModel from "./cart.schema.js";

const productSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Product name is required."],
    trim: true, // Removes whitespace from both ends
    minLength: [3, "Product title must be at least 3 characters long."],
    maxLength: [100, "Product title cannot exceed 100 characters."],
  },
  description: {
    type: String,
    required: [true, "Product description is required."],
    trim: true,
    minLength: [10, "Product description must be at least 10 characters long."],
    maxLength: [1000, "Product description cannot exceed 1000 characters."],
  },
  price: {
    type: Number,
    required: [true, "Price is required."],
    min: [0, "Price must be a positive number."],
  },
  images: [
    {
      type: String,
      required: [true, "At least one image is required."],
    },
  ],
  stock: {
    type: Number,
    required: [true, "Stock quantity is required."],
    min: [0, "Stock cannot be negative."],
  },
  category: {
    type: String,
    required: [true, "Product category is required."],
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Created by is required."],
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Reviewver id is required."],
      },
      comment: {
        type: String,
        required: [true, "Comment is required."],
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the date when the product is created
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the `updatedAt` field before saving
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

productSchema.post("findOneAndDelete", async function (doc, next) {
  if (!doc) {
    return next(); // No document to process
  }

  try {
    // Remove all occurrences of the product from every cart
    const result = await CartModel.updateMany(
      { "products.productId": doc._id }, // Match carts containing the product
      { $pull: { products: { productId: doc._id } } } // Remove the product entry
    );

    console.log(
      `Removed product ${doc._id} from all carts. Modified count: ${result.modifiedCount}`
    );
    next();
  } catch (err) {
    console.error(`Error while removing product ${doc._id} from carts`, err);
    next(err);
  }
});

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;
