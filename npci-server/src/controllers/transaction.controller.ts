import { Request, Response } from 'express';
import { processTransaction } from '../services/transaction.service';

export const handleTransaction = (req: Request, res: Response) => {
    const { pspTransactionId, amount, payerVpa, payeeVpa } = req.body;

    if (!pspTransactionId || !amount || !payerVpa || !payeeVpa) {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    const result = processTransaction({ pspTransactionId, amount, payerVpa, payeeVpa });
    res.json(result);
};
