import { NextFunction, Request, Response } from "express";
import ResponseError from "../utils/responseError.js";
import { Role } from "../types/enum/dbEnum";

/**
 * Middleware function to authorize admin access.
 * This function checks if the user making the request has admin privileges.
 * If the user is not an admin, it throws a 403 Forbidden error.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 *
 * @returns {void}
 * @throws {ResponseError} If the user is not an admin.
 */
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== Role.ADMIN && req.user?.role !== Role.MERCHANT) {
      throw new ResponseError(
        403,
        `Forbidden, you don't have permission to access this resource`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
