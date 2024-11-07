import prisma from "../config/database";
import { UserType } from "../interfaces/UserType";

export async function createUser(user: UserType) {
  return prisma.user.create({
    data: {
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      password: user.password,
      phone: user.phone,
      role: user.role,
      longitude: user.longitude,
      latitude: user.latitude,
      address: user.address,
      profile_image: user.profile_image,
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
