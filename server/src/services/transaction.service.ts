import axios from 'axios';
import {
  Transaction,
  TransactionStatus,
} from '../interfaces/transaction.interface';
import { transactionStore } from '../store';
import { NPCI_API_URL } from '../config';

const forwardToNpci = async (transaction: Transaction) => {
  try {
    const response = await axios.post(`${NPCI_API_URL}/process-payment`, {
      pspTransactionId: transaction.id,
      amount: transaction.amount,
      payerVpa: transaction.payerVpa,
      payeeVpa: transaction.payeeVpa,
    });

    const npciStatus = response.data.status;
    const pspStatus = npciStatus === 'approved' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;

    updateTransactionStatus(transaction.id, pspStatus);
  } catch (error) {
    console.error('Failed to communicate with NPCI:', error);
    updateTransactionStatus(transaction.id, TransactionStatus.FAILED);
  }
};

export const createTransaction = async (
  amount: number,
  payeeVpa: string,
  payerVpa: string
): Promise<Transaction> => {
  const newTransaction: Transaction = {
    id: `txn_${Date.now()}`,
    amount,
    payeeVpa,
    payerVpa,
    status: TransactionStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  transactionStore.set(newTransaction.id, newTransaction);

  forwardToNpci(newTransaction);

  return newTransaction;
};

export const findTransactionStatusById = (id: string): TransactionStatus | undefined => {
  return transactionStore.get(id)?.status;
};

export const updateTransactionStatus = (id: string, status: TransactionStatus) => {
  const transaction = transactionStore.get(id);
  if (transaction) {
    transaction.status = status;
    transaction.updatedAt = new Date();
    transactionStore.set(id, transaction);
    console.log(`Transaction ${id} updated to ${status}`);
  }
};