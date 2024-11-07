import { Response } from "express";

export default (
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
