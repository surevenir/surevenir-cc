import { NextFunction, Request, Response } from "express";
import { redisClient } from "../config/redis";
import { clear, log } from "console";

/**
 * Middleware that checks for cached responses in Redis.
 *
 * This middleware attempts to retrieve cached data from Redis using a cache key
 * constructed from the original URL and the user's ID. If the cached data is found,
 * it responds with the cached data, indicating it was retrieved from cache.
 * If no cached data is found or there is an error accessing Redis, it delegates
 * the request to the next middleware or route handler to fetch fresh data.
 *
 * @param req - The incoming request object containing the user's request data.
 * @param res - The response object to send back the cached or fetched data.
 * @param next - The next middleware function to call if no cached data is found.
 */
const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.WITH_CACHING === "false") {
    next();
    return;
  }

  const cacheKey = `${req.originalUrl}___${req.user?.id}`;
  console.log("Cache key:", cacheKey);

  try {
    console.log("Trying to get data from cache...");
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for:", cacheKey);
      const dataJson = JSON.parse(cachedData as string);
      delete dataJson.from_cache;
      res.json({ from_cache: true, ...dataJson });
      return;
    }

    console.log("Cache miss for:", cacheKey);
    console.log("Fetching data from the server...");

    next();
  } catch (error) {
    console.error("Redis error:", error);
    console.log("Fetching data from the server...");
    next();
  }
};

export default cacheMiddleware;
