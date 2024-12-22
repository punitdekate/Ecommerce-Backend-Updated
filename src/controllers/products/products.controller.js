import ProductRepository from "../../repositories/products/products.repository.js";
import {
  CustomApplicationError,
  CustomMongooseError,
} from "../../utility/errorhandlers/custom.errorhandler.js";
import {
  INTERNAL_SERVER_ERROR,
  MAX_PAGE_SIZE,
  PRODUCT_ID_IS_REQUIRED,
  PRODUCT_NOT_EXIST,
  STARTINDEX,
} from "../../config/constants.js";
import logger from "../../utility/errorhandlers/logger.js";

export default class ProductController {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  /** Get product detail*/
  async getProduct(req, res, next) {
    try {
      const id = req.params.productId;
      logger.info(`Product Id : ${id}`);
      if (!id.trim()) {
        throw new CustomApplicationError(PRODUCT_NOT_EXIST, 400);
      }
      const dbResponse = await this.productRepository.getById(id);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  /**  Get all product list */
  async getAllProducts(req, res, next) {
    try {
      /** Initialize the count for pagination */
      let count =
        req?.query?.count && req.query.count <= MAX_PAGE_SIZE
          ? req.query.count
          : MAX_PAGE_SIZE;

      /** Initialize the startIndex for pagination */
      let startIndex = req.query?.startIndex
        ? req.query.startIndex
        : STARTINDEX;

      logger.info(`startIndex : ${startIndex} and count : ${count}`);

      logger.info(`query : ${JSON.stringify(req.query)}`);

      const dbResponse = await this.productRepository.getAll(
        count,
        startIndex,
        { ...req.query }
      );

      logger.info(`Products List : ${JSON.stringify(dbResponse)}`);
      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const id = req.user.id;
      req.body.createdBy = id;
      const dbResponse = await this.productRepository.create(req.body);
      return res.status(201).json(dbResponse);
    } catch (error) {
      if (error instanceof CustomMongooseError) {
        next(error);
      } else {
        next(new CustomApplicationError(INTERNAL_SERVER_ERROR, 500));
      }
    }
  }

  async modifyProduct(req, res, next) {
    try {
      const id = req.user.id;
      const productId = req.params.productId;
      if (!productId) {
        throw CustomApplicationError(PRODUCT_ID_IS_REQUIRED, 400);
      }
      const dbResponse = await this.productRepository.update(
        id,
        productId,
        req.body
      );
      return res.status(200).json(dbResponse);
    } catch (error) {
      if (error instanceof CustomMongooseError) {
        next(error);
      } else {
        next(new CustomApplicationError(INTERNAL_SERVER_ERROR, 500));
      }
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const id = req.params.productId;
      const dbResponse = await this.productRepository.delete(id);
      return res.status(204).json(dbResponse);
    } catch (error) {
      if (error instanceof CustomMongooseError) {
        next(error);
      } else {
        next(new CustomApplicationError(INTERNAL_SERVER_ERROR, 500));
      }
    }
  }
}
