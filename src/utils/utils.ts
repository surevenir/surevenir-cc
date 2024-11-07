import { Response, Request } from "express";

interface CreateResponseOptions {
  status: string;
  message?: string;
  data?: any;
  code?: number;
}

const createResponse = (
  res: Response,
  { status, message = "", data = null, code = 400 }: CreateResponseOptions
) => {
  const responseBody: any = {
    status,
    ...(message && { message }),
    ...(data && { data }),
  };

  return res.status(code).json(responseBody);
};

export default createResponse;
