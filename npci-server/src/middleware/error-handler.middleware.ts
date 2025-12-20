import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.util';

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
};

export default errorHandlerMiddleware;

