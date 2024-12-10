import { Request } from "express";
import { redisClient } from "../config/redis";

/**
 * Sets a cache in Redis for the given request and response. The cache key is
 * created by appending the user ID to the original URL. The cache is set to
 * expire in 60 seconds.
 *
 * @param {Request} req - The Express request object.
 * @param {any} response - The response data to be cached.
 */
const setCache = (req: Request, response: any) => {
  const cacheKey = `${req.originalUrl}___${req.user?.id}`;
  try {
    redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 });
    console.log("Cache set for:", cacheKey);
  } catch (error) {
    console.error("Failed to set cache:", error);
  }
};

export default setCache;
