export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT'
}

export interface Transaction {
  id: string;
  amount: number;
  payeeVpa: string;
  payerVpa: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}