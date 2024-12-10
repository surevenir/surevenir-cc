import { Request } from "express";
import { redisClient } from "../config/redis";
import { ResponseBody } from "./createResponse";

/**
 * Sets a cache in Redis for the given request and response. The cache key is
 * created by appending the user ID to the original URL. The cache is set to
 * expire in 60 seconds.
 *
 * @param {Request} req - The Express request object.
 * @param {any} response - The response data to be cached.
 */
const setCache = (req: Request, response: ResponseBody) => {
  if (process.env.WITH_CACHING !== "true") {
    return;
  }

  const cacheKey = `${req.originalUrl}___${req.user?.id}`;
  try {
    console.log("Trying to set cache...");
    redisClient.set(cacheKey, JSON.stringify(response), {
      EX: parseInt(process.env.CACHING_TTL_SECONDS as string),
    }); // in seconds
    console.log("Cache set for:", cacheKey);
  } catch (error) {
    console.error("Failed to set cache:", error);
  }
};

export default setCache;
