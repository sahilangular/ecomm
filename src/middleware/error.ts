import { NextFunction, Request, Response } from "express";
import errorHandler from "../utils/utility-class.js";
import { errorController } from "../types/types.js";

export const errorMiddleWare = (
  err: errorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "";
  err.statusCode ||= 500;

  if(err.name === 'CastError') err.message = 'Invalid id';

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const tryCatch =
  (func: errorController) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };
