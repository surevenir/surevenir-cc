import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";

export async function createUser(user: User) {
  return prisma.user.create({
    data: {
      ...user,
    },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function getUsersAdmin() {
  return prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
  });
}

export async function getUserById(id: string) {
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
