import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import ResponseError from "../utils/responseError";
import { z } from "zod";

export default function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  console.error(err);

  let error = "Internal Server Error";
  let status = 500;
  let message: string | z.ZodIssue[] = "Something went wrong";

  if (err instanceof z.ZodError) {
    error = "Client Error";
    status = 400;
    message = err.errors; // ZodError errors are detailed validation errors
  }

  if (err instanceof ResponseError) {
    error = "Client Error";
    status = err.status;
    message = err.message;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        message = `Duplicate field value: ${(err.meta?.target as string) || "Unknown target"}`;
        break;
      case "P2014":
        message = `Invalid ID: ${(err.meta?.target as string) || "Unknown target"}`;
        break;
      case "P2003":
        message = `Invalid input data: ${(err.meta?.target as string) || "Unknown target"}`;
        break;
      default:
        message = "Database request error";
    }
    error = "PrismaClientKnownRequestError";
    status = 400;
  }

  return res.status(status).json({
    success: false,
    error,
    status_code: status,
    message,
    data: null,
  });
}
