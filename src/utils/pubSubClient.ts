import { PubSub } from "@google-cloud/pubsub";
import dotenv from "dotenv";

dotenv.config();

export const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.PUB_SUB_SERVICE_ACCOUNT_PATH,
});
