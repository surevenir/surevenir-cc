import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService";
import createResponse from "../utils/createResponse";
import { CreateUserRequest } from "../types/request/user";
import Controller from "../utils/controllerDecorator";

@Controller
class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateUserRequest.parse(req.body);
    const user = await userService.createUser(data);
    createResponse(res, 201, "User created successfully", user);
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const users = await userService.getAllUsers();
    createResponse(res, 200, "Users retrieved successfully", users);
  }

  async getUserAdmin(req: Request, res: Response, next: NextFunction) {
    const users = await userService.getUsersAdmin();
    createResponse(res, 200, "Admin users retrieved successfully", users);
  }
}

export default new UserController();
