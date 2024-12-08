import { Response } from "express";

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
