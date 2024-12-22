import mongoose from "mongoose";
import logger from "../utility/errorhandlers/logger.js";
import { MAX_RETRY } from "./constants.js";

async function connectToDb({ connectionString, retry }) {
  try {
    logger.info(
      `Connecting with database ${connectionString} on retry ${retry}`
    );
    mongoose
      .connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => logger.info("Connected database successfully."));
  } catch (error) {
    logger.error(`Error in connectToDB : ${error.message}`);
    if (retry < MAX_RETRY) {
      connectToDb({ connectionString, retry: ++retry });
    } else {
      throw error;
    }
  }
}

export { connectToDb };
