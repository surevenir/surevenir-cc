import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";
import MediaService from "./mediaService";
import crypto from "crypto";

class UserService {
  private mediaService: MediaService;

  constructor() {
    this.mediaService = new MediaService();
  }

  async createUser(user: User, file: Express.Request["file"]) {
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

    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      user.profile_image_url = mediaUrl;
    }

    const encryptPassword = (password: string): string => {
      // Mengambil key dari env
      const key = process.env.NEXT_PUBLIC_PASSWORD_KEY;

      if (!key) {
        throw new Error("PASSWORD_KEY is not defined");
      }

      // Hash key menjadi panjang 32 byte dengan SHA-256
      const hashedKey = crypto.createHash("sha256").update(key).digest();

      const algorithm = "aes-256-ctr";
      const iv = crypto.randomBytes(16); // Inisialisasi vector acak
      const cipher = crypto.createCipheriv(algorithm, hashedKey, iv);
      let encrypted = cipher.update(password, "utf8", "hex");
      encrypted += cipher.final("hex");

      return `${iv.toString("hex")}:${encrypted}`;
    };

    user.password = user.password === "" ? null : user.password;
    if (user.password) {
      user.password = encryptPassword(user.password);
    }
    user.role = user.role === null ? "USER" : user.role;

    return await prisma.user.create({
      data: user,
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany();
  }

  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
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
    return await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    return user;
  }

  async updateUser(user: User, file: Express.Request["file"]) {
    const existingUser = await prisma.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    if (file) {
      const mediaUrl = await this.mediaService.uploadMedia(file);
      user.profile_image_url = mediaUrl;
    }

    return await prisma.user.update({
      where: {
        id: user.id,
      },
      data: user,
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

    return await prisma.user.delete({
      where: {
        id,
      },
    });
  }
}

export default UserService;
