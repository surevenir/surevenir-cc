import { NextFunction, Request, Response } from "express";
import ResponseError from "../utils/responseError.js";
import { Role } from "@prisma/client";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.role !== Role.ADMIN) {
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
