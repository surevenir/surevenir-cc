import { Request } from "express";
import { redisClient } from "../config/redis";

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