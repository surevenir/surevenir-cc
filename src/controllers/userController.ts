import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";
import createResponse from "../utils/createResponse";
import { z } from "zod";
import { CreateUserRequest } from "../types/request/user";

export async function createUser(
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

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await userService.getAllUsers();
    createResponse(res, 200, "Users retrieved successfully", users);
  } catch (error) {
    next(error);
  }
}

export async function getUserAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await userService.getUsersAdmin();
    createResponse(res, 200, "Admin users retrieved successfully", users);
  } catch (error) {
    next(error);
  }
}
