import prisma from "../config/database";
import ResponseError from "../utils/responseError";
import { User } from "@prisma/client";
import MediaService from "./mediaService";
import crypto from "crypto";

class UserService {
  private mediaService: MediaService;

  /**
   * Initializes a new instance of the UserService class.
   * Sets up a media service for handling media-related operations.
   */
  constructor() {
    this.mediaService = new MediaService();
  }

  /**
   * Creates a new user.
   * @param user The user data to be created.
   * @param file The profile image file to be uploaded.
   * @returns The created user.
   * @throws ResponseError if the user already exists, username or email already used.
   */
  async createUser(user: User, file: Express.Request["file"]) {
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

    /**
     * Encrypts a password using the AES-256-CTR algorithm.
     *
     * @param password The plaintext password to be encrypted.
     * @returns The encrypted password in the format of "iv:encrypted".
     * @throws Error if the PASSWORD_KEY is not defined in the environment variables.
     */
    const encryptPassword = (password: string): string => {
      const key = process.env.NEXT_PUBLIC_PASSWORD_KEY;

      if (!key) {
        throw new Error("PASSWORD_KEY is not defined");
      }

      const hashedKey = crypto.createHash("sha256").update(key).digest();

      const algorithm = "aes-256-ctr";
      const iv = crypto.randomBytes(16);
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

  /**
   * Retrieves all users.
   * @returns A Promise that resolves to an array of users.
   */
  async getAllUsers() {
    return await prisma.user.findMany();
  }

  /**
   * Retrieves a user by their email address.
   * @param email - The email address of the user to be retrieved.
   * @returns A Promise that resolves to the user with the specified email.
   * @throws ResponseError if no user is found with the provided email address.
   */
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

  /**
   * Retrieves all admin users.
   * @returns A Promise that resolves to an array of admin users.
   */
  async getUsersAdmin() {
    return await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    });
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to be retrieved.
   * @returns A Promise that resolves to the user with the specified ID.
   * @throws ResponseError if no user is found with the provided ID.
   */
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

  /**
   * Deletes a user by their ID.
   * @param id - The ID of the user to be deleted.
   * @returns A Promise that resolves to the deleted user.
   * @throws ResponseError if the user is not found.
   */
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
