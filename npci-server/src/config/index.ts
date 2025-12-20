import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  successRate: parseFloat(process.env.SUCCESS_RATE || '0.95'),
  minProcessingDelayMs: parseInt(process.env.MIN_PROCESSING_DELAY_MS || '1000', 10),
  maxProcessingDelayMs: parseInt(process.env.MAX_PROCESSING_DELAY_MS || '3000', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
};

