"use strict";
import {
  INVALID_CREDENTIALS,
  USER_ALREADY_EXISTS,
  USER_NOT_EXIST,
} from "../../config/constants.js";
import UserModel from "../../schemas/users.schema.js";
import { CustomMongooseError } from "../../utility/errorhandlers/custom.errorhandler.js";

export default class UserRepository {
  async create(data) {
    try {
      const isUserPresent = await UserModel.findOne({ email: data.email });
      if (isUserPresent) {
        throw new CustomMongooseError(USER_ALREADY_EXISTS, 400);
      }
      const newUser = new UserModel(data);
      await newUser.save();
      return { success: true, data: newUser };
    } catch (error) {
      throw error;
    }
  }

  async getAll(options = {}, select = false) {
    try {
      let users;
      if (select) {
        users = await UserModel.find(options).select("-password");
      } else {
        users = await UserModel.find(options);
      }
      return { success: true, data: users };
    } catch (error) {
      throw error;
    }
  }

  async getUserByOptions(options, select = false) {
    try {
      let users;
      if (select) {
        users = await UserModel.findOne(options).select("-password");
      } else {
        users = await UserModel.findOne(options);
      }
      return { success: true, data: users };
    } catch (error) {
      throw error;
    }
  }

  async getById(id) {
    try {
      const user = await UserModel.findById(id).select("-password");
      return { success: true, data: user };
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const isUserExist = await UserModel.findById(id);
      if (!isUserExist) {
        throw new Error(USER_NOT_EXIST);
      }
      const user = await UserModel.findByIdAndUpdate(
        { _id: id },
        {
          $set: data,
        },
        { new: true, runValidators: true }
      ).select("-password");
      return { success: true, data: user };
    } catch (error) {
      throw new CustomMongooseError(error.message, 500);
    }
  }

  async token(email, password) {
    try {
      const userExist = await UserModel.findOne({ email: email });
      if (!userExist) {
        throw new CustomMongooseError(USER_NOT_EXIST, 400);
      } else {
        const isUser = await userExist.compare(password);
        if (!isUser) {
          throw new CustomMongooseError(INVALID_CREDENTIALS, 400);
        }
        const token = await userExist.generateJwtToken();
        return { success: true, data: { token: token } };
      }
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const isUserExist = await UserModel.findById(id);
      if (!isUserExist) {
        throw new CustomMongooseError(USER_NOT_EXIST, 400);
      }
      await UserModel.deleteById(id);
      return { success: true, data: {} };
    } catch (error) {
      throw error;
    }
  }

  async isAuthorizeToPerformAction(resourceId, user) {
    try {
      const isUserExist = await UserModel.findById(resourceId);
      if (!isUserExist) {
        throw new CustomMongooseError(USER_NOT_EXIST, 400);
      }
      if (user.role !== "admin" && user.id !== isUserExist._id.toString()) {
        throw new CustomMongooseError(
          "Not authorize to update another user details",
          400
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
