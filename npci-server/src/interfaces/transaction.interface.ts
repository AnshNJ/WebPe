export interface INpciTransaction {
    pspTransactionId: string;
    amount: number;
    payerVpa: string;
    payeeVpa: string;
    status: 'pending' | 'approved' | 'declined';
    timestamp: Date;
}
