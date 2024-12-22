import { USER_ID_REQUIRED } from "../../config/constants.js";
import { CustomApplicationError } from "../../utility/errorhandlers/custom.errorhandler.js";

export const validateParameterUserId = (req, res, next) => {
  if (!req.params?.userId) {
    return next(new CustomApplicationError(USER_ID_REQUIRED, 400));
  }
  next();
};
