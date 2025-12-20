import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.util';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    });
  });

  next();
};

export default requestLogger;

