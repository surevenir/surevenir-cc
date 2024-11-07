import { Request, Response } from "express";
import * as userService from "../services/userService";
import createResponse from "../utils/utils";

export async function createUser(req: Request, res: Response) {
  const { data } = req.body;

  try {
    const user = await userService.createUser(data);
    createResponse(res, {
      status: "success",
      message: "Created was successful",
      data: user,
      code: 201,
    });
  } catch (error) {
    createResponse(res, {
      status: "error",
      message: "Failed to create user" + error,
      code: 500,
    });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const user = await userService.getAllUsers();
    if (user) {
      createResponse(res, {
        status: "success",
        message: "Request was successful",
        data: user,
        code: 200,
      });
    } else {
      createResponse(res, {
        status: "error",
        message: "User not found",
        code: 404,
      });
    }
  } catch (error) {
    createResponse(res, {
      status: "error",
      message: "Failed to retrieve user",
      code: 500,
    });
  }
}

export async function getUserAdmin(req: Request, res: Response) {
  try {
    const user = await userService.getUserAdmin();

    if (user.length > 0) {
      createResponse(res, {
        status: "success",
        message: "Request was successful",
        data: user,
        code: 200,
      });
    } else {
      createResponse(res, {
        status: "error",
        message: "User not found",
        code: 404,
      });
    }
  } catch (error) {
    createResponse(res, {
      status: "error",
      message: "Failed to retrieve user",
      code: 500,
    });
  }
}
