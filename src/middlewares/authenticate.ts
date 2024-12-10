import prisma from "../config/database";
import { NextFunction, Request, Response } from "express";
import ResponseError from "../utils/responseError";

/**
 * Middleware function to authenticate user requests.
 * Extracts the token from the request headers, validates it, and attaches the user data to the request object.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 *
 * @returns {void}
 *
 * @throws Will throw a ResponseError if the token is not found or invalid.
 */
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined = req.headers.authorization?.split(" ")[1];

    if (!token) throw new ResponseError(401, "Token not found");

    token = token.replace(/"/g, "").replace(/'/g, "");

    const userId = token;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ResponseError(401, `Invalid token`);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
