import { PubSub } from "@google-cloud/pubsub";
import dotenv from "dotenv";

dotenv.config();

const pubSubClient = new PubSub({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.PUB_SUB_SERVICE_ACCOUNT_PATH,
});

export const publishMessage = async (
  message: string,
  topic: string,
  attributes?: { [key: string]: string | object }
) => {
  const dataBuffer = Buffer.from(message);

  try {
    const processedAttributes = attributes
      ? Object.fromEntries(
          Object.entries(attributes).map(([key, value]) => [
            key,
            typeof value === "object" ? JSON.stringify(value) : value,
          ])
        )
      : {};

    const messageId = await pubSubClient.topic(topic).publishMessage({
      data: dataBuffer,
      attributes: processedAttributes,
    });

    console.log(`Message "${message}" published with ID: ${messageId}`);
    return messageId;
  } catch (error) {
    console.error("Error publishing message:", error);
    throw error;
  }
};

// contoh penerapan:
/*
    const message = `Data kategori dikirim`;
    const attributes = {
      eventType: "CATEGORY_FETCH",
      source: "categoryService",
      priority: "high",
    };

    const messageId = await publishMessage(message, topic, attributes);
    console.log(`Pesan berhasil dikirim dengan ID: ${messageId}`);
*/
