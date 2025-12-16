import prisma from '../utils/prisma.util';
import BadRequestError from '../errors/bad-request';
import NotFoundError from '../errors/not-found';
import logger from '../utils/logger.util';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Get wallet balance for a user
 */
export const getWalletBalance = async (userId: number): Promise<Decimal> => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  return wallet.balance;
};

/**
 * Get wallet by user ID
 */
export const getWalletByUserId = async (userId: number) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  return wallet;
};

/**
 * Get wallet by VPA (Virtual Payment Address)
 */
export const getWalletByVpa = async (vpa: string) => {
  const vpaRecord = await prisma.vpa.findUnique({
    where: { vpa },
    include: {
      user: {
        include: { wallet: true },
      },
    },
  });

  if (!vpaRecord || !vpaRecord.user.wallet) {
    throw new NotFoundError('Wallet not found for the given VPA');
  }

  return vpaRecord.user.wallet;
};

/**
 * Validate if user has sufficient balance
 */
export const validateSufficientBalance = async (
  userId: number,
  amount: number
): Promise<boolean> => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  const balance = Number(wallet.balance);
  return balance >= amount;
};

/**
 * Deduct amount from payer wallet (atomic operation)
 */
export const deductFromWallet = async (
  userId: number,
  amount: number
): Promise<{ balance: Decimal }> => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  const currentBalance = Number(wallet.balance);
  const newBalance = currentBalance - amount;

  if (newBalance < 0) {
    throw new BadRequestError('Insufficient balance');
  }

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balance: new Decimal(newBalance.toFixed(2)),
    },
  });

  logger.info(`Deducted ${amount} from wallet`, {
    userId,
    amount,
    previousBalance: currentBalance,
    newBalance: Number(updatedWallet.balance),
  });

  return { balance: updatedWallet.balance };
};

/**
 * Add amount to payee wallet (atomic operation)
 */
export const addToWallet = async (
  userId: number,
  amount: number
): Promise<{ balance: Decimal }> => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new NotFoundError('Wallet not found');
  }

  const currentBalance = Number(wallet.balance);
  const newBalance = currentBalance + amount;

  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: {
      balance: new Decimal(newBalance.toFixed(2)),
    },
  });

  logger.info(`Added ${amount} to wallet`, {
    userId,
    amount,
    previousBalance: currentBalance,
    newBalance: Number(updatedWallet.balance),
  });

  return { balance: updatedWallet.balance };
};

/**
 * Process transaction balance updates atomically
 * Deducts from payer and adds to payee in a single database transaction
 * Rolls back on any failure
 */
export const processTransactionBalance = async (
  payerVpa: string,
  payeeVpa: string,
  amount: number
): Promise<{
  payerBalance: Decimal;
  payeeBalance: Decimal;
}> => {
  // Validate amount
  if (amount <= 0) {
    throw new BadRequestError('Transaction amount must be greater than zero');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await prisma.$transaction(async (tx: any) => {
    // Get payer wallet by VPA
    const payerVpaRecord = await tx.vpa.findUnique({
      where: { vpa: payerVpa },
      include: {
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!payerVpaRecord || !payerVpaRecord.user.wallet) {
      throw new NotFoundError('Payer wallet not found');
    }

    // Get payee wallet by VPA
    const payeeVpaRecord = await tx.vpa.findUnique({
      where: { vpa: payeeVpa },
      include: {
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!payeeVpaRecord || !payeeVpaRecord.user.wallet) {
      throw new NotFoundError('Payee wallet not found');
    }

    // Prevent self-transfer
    if (payerVpaRecord.userId === payeeVpaRecord.userId) {
      throw new BadRequestError('Cannot transfer to your own VPA');
    }

    const payerWallet = payerVpaRecord.user.wallet;
    const payeeWallet = payeeVpaRecord.user.wallet;

    // Validate sufficient balance
    const payerBalance = Number(payerWallet.balance);
    if (payerBalance < amount) {
      throw new BadRequestError('Insufficient balance');
    }

    // Calculate new balances
    const newPayerBalance = payerBalance - amount;
    const newPayeeBalance = Number(payeeWallet.balance) + amount;

    // Update both wallets atomically
    const [updatedPayerWallet, updatedPayeeWallet] = await Promise.all([
      tx.wallet.update({
        where: { userId: payerVpaRecord.userId },
        data: {
          balance: new Decimal(newPayerBalance.toFixed(2)),
        },
      }),
      tx.wallet.update({
        where: { userId: payeeVpaRecord.userId },
        data: {
          balance: new Decimal(newPayeeBalance.toFixed(2)),
        },
      }),
    ]);

    logger.info('Transaction balance processed successfully', {
      payerVpa,
      payeeVpa,
      amount,
      payerBalance: Number(updatedPayerWallet.balance),
      payeeBalance: Number(updatedPayeeWallet.balance),
    });

    return {
      payerBalance: updatedPayerWallet.balance,
      payeeBalance: updatedPayeeWallet.balance,
    };
  });
};

/**
 * Rollback transaction balance updates
 * Reverses a previous transaction (adds back to payer, deducts from payee)
 */
export const rollbackTransactionBalance = async (
  payerVpa: string,
  payeeVpa: string,
  amount: number
): Promise<void> => {
  // Use Prisma transaction for atomicity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    // Get payer wallet by VPA
    const payerVpaRecord = await tx.vpa.findUnique({
      where: { vpa: payerVpa },
      include: {
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!payerVpaRecord || !payerVpaRecord.user.wallet) {
      throw new NotFoundError('Payer wallet not found for rollback');
    }

    // Get payee wallet by VPA
    const payeeVpaRecord = await tx.vpa.findUnique({
      where: { vpa: payeeVpa },
      include: {
        user: {
          include: { wallet: true },
        },
      },
    });

    if (!payeeVpaRecord || !payeeVpaRecord.user.wallet) {
      throw new NotFoundError('Payee wallet not found for rollback');
    }

    const payerWallet = payerVpaRecord.user.wallet;
    const payeeWallet = payeeVpaRecord.user.wallet;

    // Calculate rollback balances (reverse the transaction)
    const newPayerBalance = Number(payerWallet.balance) + amount;
    const newPayeeBalance = Number(payeeWallet.balance) - amount;

    // Validate payee has enough balance for rollback
    if (newPayeeBalance < 0) {
      logger.error('Rollback failed: Payee has insufficient balance', {
        payerVpa,
        payeeVpa,
        amount,
        payeeBalance: Number(payeeWallet.balance),
      });
      throw new BadRequestError(
        'Rollback failed: Payee has insufficient balance'
      );
    }

    // Update both wallets atomically
    await Promise.all([
      tx.wallet.update({
        where: { userId: payerVpaRecord.userId },
        data: {
          balance: new Decimal(newPayerBalance.toFixed(2)),
        },
      }),
      tx.wallet.update({
        where: { userId: payeeVpaRecord.userId },
        data: {
          balance: new Decimal(newPayeeBalance.toFixed(2)),
        },
      }),
    ]);

    logger.info('Transaction balance rolled back successfully', {
      payerVpa,
      payeeVpa,
      amount,
    });
  });
};
