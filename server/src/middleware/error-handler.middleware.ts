import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomAPIError from '../errors/custom-api';
import logger from '../utils/logger.util';

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  // Log unexpected errors
  logger.error('Unexpected error:', { error: err.message, stack: err.stack });
  
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: 'Something went wrong, please try again later' });
};

export default errorHandlerMiddleware;
