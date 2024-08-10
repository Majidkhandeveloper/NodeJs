import { Response } from "express";

export const ResponseMessage = (
  res: Response,
  status: number,
  message?: string,
  data?: any
) => {
  res.status(status).json({
    message,
    length: data?.length,
    data,
  });
};
