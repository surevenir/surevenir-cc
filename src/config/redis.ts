import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: process.env.REDiS_HOST, 
    port: parseInt(process.env.REDiS_PORT as string),
    reconnectStrategy: (retries: number, cause: Error) => {
      console.error(`Reconnect attempt ${retries} failed. Cause:`, cause);
      return false; // Stop retrying
    },
  },
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
};

export { redisClient, connectRedis };
