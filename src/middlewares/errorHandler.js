import ResponseError from "../util/response-error.js";
import { Prisma } from "@prisma/client";

export default (err, req, res, next) => {
  console.error(err);

  let error = "Internal Server Error";
  let status = 500;
  let message = "Something went wrong";

  if (err instanceof ResponseError) {
    error = "Client Error";
    status = err.status;
    message = err.message;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        message = `Duplicate field value: ${err.meta.target}`;
      case "P2014":
        message = `Invalid ID: ${err.meta.target}`;
      case "P2003":
        message = `Invalid input data: ${err.meta.target}`;
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
};
