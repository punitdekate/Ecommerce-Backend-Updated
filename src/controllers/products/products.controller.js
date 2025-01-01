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
      logger.info("----------Start GetProduct----------");

      const id = req.params.productId;
      logger.info(`Product Id : ${id}`);
      if (!id.trim()) {
        throw new CustomApplicationError(PRODUCT_NOT_EXIST, 400);
      }
      const dbResponse = await this.productRepository.getById(id);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End GetProduct----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  /**  Get all product list */
  async getAllProducts(req, res, next) {
    try {
      logger.info("----------Start GetAllProduct----------");

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
      logger.info("----------End GetAllProduct----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      logger.info("----------Start CreateProduct----------");

      const id = req.user.id;
      logger.info(`User Id : ${id}`);

      req.body.createdBy = id;
      
      logger.info(`files : ${JSON.stringify(req.files)}`);
      const images =
        req?.files?.length > 0
          ? req.files.map((file) => {
              return `http://localhost:4000/productImages/${file.filename}`;
            })
          : [];
      if (images.length > 0) {
        req.body.images = images;
      }
      logger.info(`Req Body : ${JSON.stringify(req.body)}`);

      const dbResponse = await this.productRepository.create(req.body);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End CreateProduct----------");

      return res.status(201).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async modifyProduct(req, res, next) {
    try {
      logger.info("----------Start ModifyProduct----------");

      const id = req.user.id;
      logger.info(`User Id : ${id}`);

      logger.info(`files : ${JSON.stringify(req.files)}`);
      const images = req?.files?.length > 0 ? req.files.map((file)=>{
        return `http://localhost:4000/productImages/${file.filename}`;
      }) : [];
      if(images.length > 0){
        // req.body.images = images;
        req.body.images = [...images, req.body?.images ? req.body?.images : []];

      }
      logger.info(`Req Body : ${JSON.stringify(req.body)}`);

      const productId = req.params.productId;
      logger.info(`Product Id : ${productId}`);

      if (!productId) {
        throw CustomApplicationError(PRODUCT_ID_IS_REQUIRED, 400);
      }
      const dbResponse = await this.productRepository.update(
        id,
        productId,
        req.body
      );
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End ModifyProduct----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
        next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      logger.info("----------Start DeleteProduct----------");
      const userId = req.user.id;
      logger.info(`User Id : ${userId}`);

      const productId = req.params.productId;
      logger.info(`Product Id : ${productId}`);

      const dbResponse = await this.productRepository.delete(userId, productId);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End DeleteProduct----------");

      return res.status(204).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }
}
