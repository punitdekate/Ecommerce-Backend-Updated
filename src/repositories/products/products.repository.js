import {
  NOT_AUTHORIZED_TO_UPDATE_PRODUCT,
  PRODUCT_ALREADY_EXISTS,
  PRODUCT_NOT_EXIST,
} from "../../config/constants.js";
import ProductModel from "../../schemas/products.schema.js";
import { CustomMongooseError } from "../../utility/errorhandlers/custom.errorhandler.js";

export default class ProductRepository {
  async getById(id) {
    try {
      const product = await ProductModel.findById(id);
      return { success: true, data: product };
    } catch (error) {
      throw new CustomMongooseError(error.message, 401);
    }
  }
  async getAll(count, startIndex, filter = {}) {
    try {
      const { category, brand, minPrice, maxPrice, title } = filter;

      // Prepare filter object
      const queryFilter = {};

      if (category) {
        queryFilter.category = category; // Assuming category is a string
      }

      if (brand) {
        queryFilter.brand = brand; // Assuming brand is a string
      }

      if (minPrice != null) {
        // Check if minPrice is defined
        queryFilter.price = { ...queryFilter.price, $gte: minPrice }; // Greater than or equal to minPrice
      }

      if (maxPrice != null) {
        // Check if maxPrice is defined
        queryFilter.price = { ...queryFilter.price, $lte: maxPrice }; // Less than or equal to maxPrice
      }

      if (title) {
        queryFilter.title = { $regex: title, $options: "i" }; // Case-insensitive search
      }
      const totalDocs = await ProductModel.countDocuments(queryFilter);
      const products = await ProductModel.find(queryFilter)
        .sort({ title: 1 })
        .skip(startIndex - 1)
        .limit(count);
      return { success: true, data: { total: totalDocs, products } };
    } catch (error) {
      throw new CustomMongooseError(error.message, 401);
    }
  }

  async create(productData) {
    try {
      const productExist = await ProductModel.findOne({
        title: productData.title,
      });
      if (productExist) {
        throw new CustomMongooseError(PRODUCT_ALREADY_EXISTS, 400);
      } else {
        const product = new ProductModel(productData);
        await product.save();
        return { success: true, data: product };
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id, productId, productData) {
    try {
      const productExist = await ProductModel.findById(productId);
      if (!productExist) {
        throw new CustomMongooseError(PRODUCT_NOT_EXIST, 400);
      } else {
        if (productExist.createdBy.toString() !== id) {
          throw new CustomMongooseError(NOT_AUTHORIZED_TO_UPDATE_PRODUCT, 400);
        } else {
          const product = await ProductModel.findByIdAndUpdate(
            { _id: productId },
            {
              $set: productData,
            },
            { new: true, runValidators: true }
          );
          return { success: true, data: product };
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async delete(id, productId) {
    try {
      const productExist = await ProductModel.findById(productId);
      if (!productExist) {
        throw new CustomMongooseError(PRODUCT_NOT_EXIST, 400);
      } else {
        if (productExist.createdBy !== id) {
          throw new CustomMongooseError(NOT_AUTHORIZED_TO_UPDATE_PRODUCT, 400);
        } else {
          await ProductModel.findByIdAndDelete(productId);
          return { success: true, data: null };
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
