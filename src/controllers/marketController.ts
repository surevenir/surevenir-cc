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
    const user = await userService.createUser(data);
    createResponse(res, 201, "User created successfully", user);
  } catch (error) {
    next(error);
  }
}
