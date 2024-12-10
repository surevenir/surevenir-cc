import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: "localhost", // example
    port: 6379,
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
