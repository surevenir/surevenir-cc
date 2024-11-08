import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";
import createResponse from "../utils/createResponse";
import { z } from "zod";
import { CreateUserRequest } from "../types/request/user";

export async function createMarket(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { data } = req.body;
  CreateUserRequest.parse(data);

  try {
  } catch (error) {
    next(error);
  }
}
