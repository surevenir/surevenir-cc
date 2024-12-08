import { NextFunction, Request, Response } from "express";
import { redisClient } from "../config/redis";

const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cacheKey = `${req.originalUrl}___${req.user?.id}`;

  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for:", cacheKey);
      const dataJson = JSON.parse(cachedData);
      return res.json({ from_cache: true, ...dataJson });
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
