import { INpciTransaction } from '../interfaces/transaction.interface';

const transactions: Map<string, INpciTransaction> = new Map();

export const processTransaction = (transaction: Omit<INpciTransaction, 'status' | 'timestamp'>): INpciTransaction => {
    const newTransaction: INpciTransaction = {
        ...transaction,
        status: Math.random() > 0.2 ? 'approved' : 'declined', // 80% chance of approval
        timestamp: new Date(),
    };
    transactions.set(newTransaction.pspTransactionId, newTransaction);
    return newTransaction;
}
