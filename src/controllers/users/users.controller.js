import { isValidObjectId } from "../../utility/common/id.validator.js";
import {
  INVALID_ID,
  USER_ID_REQUIRED,
  USERNAME_PASSWORD_MISSING,
} from "../../config/constants.js";
import UserRepository from "../../repositories/users/users.repository.js";
import { CustomApplicationError } from "../../utility/errorhandlers/custom.errorhandler.js";
import { sendNotification } from "../../utility/email.utility.js";
import logger from "../../utility/errorhandlers/logger.js";

export default class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async generateToken(req, res, next) {
    try {
      logger.info("----------Start GenerateToken----------");

      const { email, password } = req.body;
      logger.info(`email : ${email}`);
      if (!email || !password) {
        return res
          .status(400)
          .json({ status: false, msg: USERNAME_PASSWORD_MISSING });
      }
      const dbResponse = await this.userRepository.token(email, password);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End GenerateToken----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }
  async getAllUsers(req, res, next) {
    try {
      logger.info("----------Start GetAllUsers----------");

      const dbResponse = await this.userRepository.getAll();
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End GetAllUsers----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      logger.info("----------Start CreateUser----------");

      const userData = req.body;
      const dbResponse = await this.userRepository.create(userData);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);

      await sendNotification(
        userData.email,
        "Registered successfully.",
        `Hello ${userData.name} welcome to ecommerce`
      );

      logger.info("----------End CreateUser----------");

      return res.status(201).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      logger.info("----------Start GetUser----------");

      const { id } = req.params;
      logger.info(`User Id : ${id}`);
      if (!id.trim() || !isValidObjectId(id)) {
        throw new CustomApplicationError(INVALID_ID, 400);
      }
      const dbResponse = await this.userRepository.getById(id);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);

      logger.info("----------End GetUser----------");

      res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async modifyUser(req, res, next) {
    try {
      logger.info("----------Start ModifyUser----------");

      const { id } = req.params;
      const user = req.user;
      logger.info(`User Id : ${id}, User : ${JSON.stringify(user)}`);
      if (!id.trim() || !isValidObjectId(id)) {
        throw new CustomApplicationError(USER_ID_REQUIRED, 400);
      }
      if (req.file) {
        req.body.profile = { image: req.file.filename, path: req.file.path };
      }

      await this.userRepository.isAuthorizeToPerformAction(id, user);
      const dbResponse = await this.userRepository.update(id, req.body);
      logger.info(`dbResponse : ${JSON.stringify(dbResponse)}`);
      logger.info("----------End ModifyUser----------");

      return res.status(200).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }

  async resetUserPassword(req, res, next) {
    try {
      const { email, oldPassword, newPassword } = req.body;
      const userResult = await this.userRepository.getUserByOptions(
        { email: email },
        true
      );
      const user = userResult.data;
      if (!user) {
        return res
          .status(404)
          .json({ success: false, data: "User not found." });
      }
      const isPasswordVerified = await user.compare(oldPassword);
      if (!isPasswordVerified) {
        return res
          .status(400)
          .json({ success: false, data: "Current password is incorrect." });
      }
      const updatedPasswordUser = await this.userRepository.update({
        password: newPassword,
      });
      return res.status(200).json({ status: true, data: updatedPasswordUser });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!id) {
        throw new CustomApplicationError(ID_NOT_PRESENT, 400);
      }
      if (!isValidObjectId(id)) {
        throw new CustomApplicationError(INVALID_ID, 400);
      }
      await this.userRepository.isAuthorizeToPerformAction(id, user);
      const dbResponse = await this.userRepository.delete(id);
      return res.status(204).json(dbResponse);
    } catch (error) {
      next(error);
    }
  }
}
