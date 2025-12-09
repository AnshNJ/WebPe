import { Request, Response } from 'express';
import {
  createTransaction,
  findTransactionStatusById,
} from '../services/transaction.service';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, payeeVpa, payerVpa } = req.body;
    if (!amount || !payeeVpa || !payerVpa) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const transaction = await createTransaction(amount, payeeVpa, payerVpa);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransactionStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const status = findTransactionStatusById(id);
    if (!status) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(200).json({ status });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};