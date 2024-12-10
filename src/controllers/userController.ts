import { Request, Response, NextFunction } from "express";
import createResponse from "../utils/createResponse";
import {
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/request/userRequest";
import Controller from "../utils/controllerDecorator";
import UserService from "../services/userService";

@Controller
class UserController {
  private userService: UserService;

  /**
   * Constructs an instance of the UserController class.
   *
   * This constructor initializes the UserService, setting up the necessary
   * service to handle user-related operations.
   */
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Creates a new user.
   * @param req Request object containing the request body and a single file.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the created user.
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    const data: any = CreateUserRequest.parse(req.body);
    const user = await this.userService.createUser(data, req.file);
    createResponse(res, 201, "User created successfully", user);
  }

  /**
   * Retrieves all users.
   * @param req Request object.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an array of users.
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const users = await this.userService.getAllUsers();
    createResponse(res, 200, "Users retrieved successfully", users);
  }

  /**
   * Retrieves a user by ID.
   * @param req Request object containing the user ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the user with the specified ID.
   */
  async getUser(req: Request, res: Response, next: NextFunction) {
    const user = await this.userService.getUserById(req.params.id);
    createResponse(res, 200, "User retrieved successfully", user);
  }

  /**
   * Updates a user by ID.
   * @param req Request object containing the user ID as a parameter and the updated data in the body.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to the updated user.
   */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data: any = UpdateUserRequest.parse(req.body);
    const user = await this.userService.updateUser({ id, ...data }, req.file);
    createResponse(res, 200, "User updated successfully", user);
  }

  /**
   * Deletes a user by ID.
   * @param req Request object containing the user ID as a parameter.
   * @param res Response object to send the response.
   * @param next NextFunction object to call the next middleware.
   * @returns A Promise that resolves to an object with the deleted user ID.
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    await this.userService.deleteUserById(id);
    createResponse(res, 200, "User deleted successfully", { id });
  }
}

export default new UserController();
