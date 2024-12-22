import jwt from "jsonwebtoken";
import { CustomApplicationError } from "../../utility/errorhandlers/custom.errorhandler.js";
import { INTERNAL_SERVER_ERROR } from "../../config/constants.js";

export async function auth(req, res, next) {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "unauthorize",
      });
    }
    if (token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    next(new CustomApplicationError(error.message, 400));
  }
}
