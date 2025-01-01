import {
  NOT_AUTHORIZED_TO_UPDATE_PRODUCT,
  PRODUCT_ALREADY_EXISTS,
  PRODUCT_NOT_EXIST,
} from "../../config/constants.js";
import ProductModel from "../../schemas/products.schema.js";
import { CustomMongooseError } from "../../utility/errorhandlers/custom.errorhandler.js";
import logger from "../../utility/errorhandlers/logger.js";

export default class ProductRepository {
  async getById(id) {
    try {
      logger.info("----------Start Repo GetProductById----------");
      const product = await ProductModel.findById(id);
      logger.info(`Product : ${product}`);
      logger.info("----------End Repo GetProductById----------");
      return { success: true, data: product };
    } catch (error) {
      throw new CustomMongooseError(error.message, 401);
    }
  }
  async getAll(count, startIndex, filter = {}) {
    try {
      logger.info("----------Start Repo GetAllProducts----------");
      let { category, brand, minPrice, maxPrice, title, sort, order } = filter;
      logger.info(`Filter : ${JSON.stringify(filter)}`);
      // Prepare filter object
      const queryFilter = {};
      if (!sort) {
        sort = "title";
      }
      if (!order) {
        order = 1;
      }
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
      logger.info(`Query Filter : ${JSON.stringify(queryFilter)}`);
      let sortObject = {};
      sortObject[sort] = order ? Number(order) : 1;
      logger.info(`Sort Object : ${JSON.stringify(sortObject)}`);
      const totalDocs = await ProductModel.countDocuments(queryFilter);
      const products = await ProductModel.find(queryFilter)
        .sort(sortObject)
        .skip(startIndex - 1)
        .limit(count);
      return { success: true, data: { total: totalDocs, products } };
    } catch (error) {
      throw new CustomMongooseError(error.message, 401);
    }
  }

  async create(productData) {
    try {
      logger.info("----------Start Repo CreateProduct----------");
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
      logger.info("----------Start Repo UpdateProduct----------");
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

  async delete(userId, productId) {
    try {
      logger.info("----------Start Repo DeleteProduct----------");
      const productExist = await ProductModel.findById(productId);
      if (!productExist) {
        throw new CustomMongooseError(PRODUCT_NOT_EXIST, 400);
      } else {
        if (!productExist.createdBy.equals(userId)) {
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
