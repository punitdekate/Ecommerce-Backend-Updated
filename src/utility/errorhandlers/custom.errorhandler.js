import { INTERNAL_SERVER_ERROR } from "../../config/constants.js";
import logger from "./logger.js";

export class CustomMongooseError extends Error {
  constructor(errorMessage, errorCode = 500) {
    super(errorMessage);
    this.statusCode = errorCode;
  }

  getMessage() {
    return {
      status: false,
      message: this.message, // Corrected usage of `this.message`
    };
  }
}

export class CustomApplicationError extends Error {
  constructor(errorMessage, errorCode = 500) {
    super(errorMessage);
    this.statusCode = errorCode;
  }

  getMessage() {
    return {
      status: false,
      message: this.message, // Corrected usage of `this.message`
    };
  }
}

const errorHandler = (err, req, res, next) => {
  // Log detailed error to the file
  logger.error(
    `Time: ${new Date().toISOString()}\nRequest URL: ${req.url}\nRequest Body: ${JSON.stringify(
      req.body
    )}\nError Stack: ${err.stack || err}`
  );

  if (err) {
    if (err instanceof CustomMongooseError) {
      if (err.name === "ValidationError") {
        const errorMessage = Object.values(err.errors).map(
          (val) => val.message
        );
        return res.status(400).json({
          success: false,
          msg: errorMessage,
        });
      } else {
        return res.status(err.statusCode).json({
          success: false,
          msg: err.message,
        });
      }
    } else if (err instanceof CustomApplicationError) {
      return res.status(err.statusCode).json({
        success: false,
        msg: err.message,
      });
    } else {
      // Log server errors to console
      logger.error(err);
      return res.status(500).json({
        success: false,
        msg: INTERNAL_SERVER_ERROR,
      });
    }
  } else {
    next();
  }
};

export { errorHandler };
