import { Response } from "express";

export type ResponseBody = {
  from_cache: boolean;
  success: boolean;
  status_code: number;
  message: string;
  timestamp: string;
  data: any;
};

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
): ResponseBody => {
  const isSuccess: boolean = statucCode >= 200 && statucCode < 300;

  const body: ResponseBody = {
    from_cache: false,
    success: isSuccess,
    status_code: statucCode,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  res.status(statucCode).json(body);
  return body;
};
