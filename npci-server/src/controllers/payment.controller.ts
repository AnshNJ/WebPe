import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { processPayment, ProcessPaymentRequest } from '../services/payment.service';
import logger from '../utils/logger.util';

export const processPaymentController = async (req: Request, res: Response) => {
  try {
    const paymentData: ProcessPaymentRequest = req.body;

    const result = await processPayment(paymentData);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error('Error processing payment', error);

    if (error instanceof Error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Bad Request',
        message: error.message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing payment',
      });
    }
  }
};

