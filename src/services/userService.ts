import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";

class UserService {
  async createUser(user: User) {
    // make sure id, username, email is unique
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { username: user.username },
          { email: user.email },
        ],
      },
    });

    if (existingUser?.id === user.id)
      throw new ResponseError(409, "User already exists");
    if (existingUser?.username === user.username)
      throw new ResponseError(409, "Username already used");
    if (existingUser?.email === user.email)
      throw new ResponseError(409, "Email already used");

    return prisma.user.create({
      data: {
        ...user,
      },
    });
  }

  async getAllUsers() {
    return prisma.user.findMany();
  }

  async getUserByEmail(email: string) {
    const user = prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    return user;
  }

  async getUsersAdmin() {
    return prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    });
  }

  async getUserById(id: string) {
    const user = prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    return user;
  }

  async updateUser(user: User) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    return prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...user,
        updatedAt: new Date(),
      },
    });
  }

  async deleteUserById(id: string) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    return prisma.user.delete({
      where: {
        id,
      },
    });
  }
}

export default UserService;
