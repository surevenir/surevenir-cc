import prisma from "../config/database";
import { NextFunction, Request, Response } from "express";
import ResponseError from "../utils/responseError";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined = req.headers.authorization?.split(" ")[1];

    if (!token) throw new ResponseError(401, "Token not found");

    token = token.replace(/"/g, "").replace(/'/g, ""); // remove quotes if exist

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
