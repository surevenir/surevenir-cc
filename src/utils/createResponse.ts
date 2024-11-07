import { Response, Request } from "express";

const createResponse = (
  res: Response,
  statucCode: number,
  message: string,
  data: any
) => {
  const isSuccess: boolean = statucCode >= 200 && statucCode < 300;

  const body = {
    success: isSuccess,
    status_code: statucCode,
    message,
    data,
  };

  return res.status(statucCode).json(body);
};

export default createResponse;
