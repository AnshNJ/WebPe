import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth routes
  if (req.path.startsWith('/api/v1/auth')) {
    return next();
  }

  // Create compact log object
  const logData = {
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body: Object.keys(req.body || {}).length > 0 ? req.body : undefined,
    ip: req.ip || req.socket.remoteAddress,
  };

  // Log as compact single-line JSON
  logger.info(`${req.method} ${req.path}`, logData);

  next();
};

export default requestLogger;
