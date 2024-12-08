import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: "10.0.0.3", // example 
    port: 6379,
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
};

export { redisClient, connectRedis };
