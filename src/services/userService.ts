import e from "express";
import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";

export async function createUser(user: User) {
  // make sure id, username, email is unique
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ id: user.id }, { username: user.username }, { email: user.email }],
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

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function getUserByEmail(email: string) {
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
