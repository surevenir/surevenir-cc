import { Response } from "express";

/**
 * A utility function to create a standardized response object for API endpoints.
 *
 * @param res - The Express.js response object.
 * @param statucCode - The HTTP status code for the response.
 * @param message - A message describing the response.
 * @param data - The data to be included in the response body.
 *
 * @returns The Express.js response object with the formatted response body.
 */
export default (
  res: Response,
  statucCode: number,
  message: string,
  data: any
) => {
  const isSuccess: boolean = statucCode >= 200 && statucCode < 300;

  const body = {
    from_cache: false,
    success: isSuccess,
    status_code: statucCode,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  return res.status(statucCode).json(body);
};
