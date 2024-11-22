import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import { CreateUserRequest, UpdateUserRequest } from "../types/request/user";
import Controller from "../utils/controllerDecorator";
import UserService from "../services/userService";

@Controller
class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateUserRequest.parse(req.body);
    const user = await this.userService.createUser(data);
    createResponse(res, 201, "User created successfully", user);
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const users = await this.userService.getAllUsers();
    createResponse(res, 200, "Users retrieved successfully", users);
  }

  async getUserAdmin(req: Request, res: Response, next: NextFunction) {
    const users = await this.userService.getUsersAdmin();
    createResponse(res, 200, "Admin users retrieved successfully", users);
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data: any = UpdateUserRequest.parse(req.body);
    const user = await this.userService.updateUser({ id, ...data });
    createResponse(res, 200, "User updated successfully", user);
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.userService.deleteUserById(id);
    createResponse(res, 200, "User deleted successfully", { id });
  }
}

export default new UserController();
