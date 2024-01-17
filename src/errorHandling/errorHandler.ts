import { Request, Response, NextFunction } from "express";
import ApiError from "./ApiError";

function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isProduction: boolean = process.env.NODE_ENV === "production";

  if (!err.status) {
    err.message = isProduction ? "something went wrong" : err.message;
    err.status = 500;
  }

  return res.status(err.status).json({ message: err.message });
}

export default errorHandler;
