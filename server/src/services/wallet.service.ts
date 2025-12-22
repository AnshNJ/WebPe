import prisma from '../utils/prisma.util';
import BadRequestError from '../errors/bad-request';
import NotFoundError from '../errors/not-found';
import logger from '../utils/logger.util';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

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
 * Validate if user has sufficient balance (excluding locked balance)
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

  const balance = new Decimal(wallet.balance);
  const lockedBalance = new Decimal(wallet.lockedBalance || 0);
  const availableBalance = balance.minus(lockedBalance);
  const amountDecimal = new Decimal(amount);
  
  return availableBalance.gte(amountDecimal);
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
 * Earmark transaction balance (Earmark and Release pattern)
 * - Checks if payer has sufficient balance
 * - Debits amount from payer's balance
 * - Increments same amount into payer's lockedBalance
 * - Does NOT credit the payee yet (waits for confirmation)
 * 
 * @param tx - Prisma transaction client for atomicity
 * @param payerVpa - VPA of the payer
 * @param payeeVpa - VPA of the payee
 * @param amount - Transaction amount
 * @returns Updated payer wallet balance and lockedBalance
 */
export const processTransactionBalance = async (
  tx: Prisma.TransactionClient,
  payerVpa: string,
  payeeVpa: string,
  amount: number | Decimal
): Promise<{ payerBalance: Decimal; payerLockedBalance: Decimal }> => {
  // Validate amount
  const amountDecimal = typeof amount === 'number' ? new Decimal(amount) : amount;
  if (amountDecimal.lte(0)) {
    throw new BadRequestError('Transaction amount must be greater than zero');
  }

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

  // Get payee wallet by VPA (for validation only)
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

  // Validate sufficient balance (check available balance, not including locked)
  const payerBalance = new Decimal(payerWallet.balance);
  const payerLockedBalance = new Decimal(payerWallet.lockedBalance || 0);
  const availableBalance = payerBalance.minus(payerLockedBalance);

  if (availableBalance.lt(amountDecimal)) {
    throw new BadRequestError('Insufficient balance');
  }

  // Calculate new balances using Decimal arithmetic
  const newPayerBalance = payerBalance.minus(amountDecimal);
  const newPayerLockedBalance = payerLockedBalance.plus(amountDecimal);

  // Update payer wallet: debit balance and increment lockedBalance
  const updatedPayerWallet = await tx.wallet.update({
    where: { userId: payerVpaRecord.userId },
    data: {
      balance: newPayerBalance,
      lockedBalance: newPayerLockedBalance,
    },
  });

  logger.info('Transaction balance earmarked successfully', {
    payerVpa,
    payeeVpa,
    amount: amountDecimal.toString(),
    payerBalance: updatedPayerWallet.balance.toString(),
    payerLockedBalance: updatedPayerWallet.lockedBalance.toString(),
  });

  return {
    payerBalance: updatedPayerWallet.balance,
    payerLockedBalance: updatedPayerWallet.lockedBalance,
  };
};

/**
 * Confirm transaction balance (Release phase)
 * - Decrements amount from payer's lockedBalance
 * - Increments amount into payee's balance
 * - Called when NPCI webhook returns SUCCESS
 * 
 * @param tx - Prisma transaction client for atomicity
 * @param payerVpa - VPA of the payer
 * @param payeeVpa - VPA of the payee
 * @param amount - Transaction amount to confirm
 */
export const confirmTransactionBalance = async (
  tx: Prisma.TransactionClient,
  payerVpa: string,
  payeeVpa: string,
  amount: number | Decimal
): Promise<void> => {
  const amountDecimal = typeof amount === 'number' ? new Decimal(amount) : amount;

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
    throw new NotFoundError('Payer wallet not found for confirmation');
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
    throw new NotFoundError('Payee wallet not found for confirmation');
  }

  const payerWallet = payerVpaRecord.user.wallet;
  const payeeWallet = payeeVpaRecord.user.wallet;

  // Validate payer has enough locked balance
  const payerLockedBalance = new Decimal(payerWallet.lockedBalance || 0);
  if (payerLockedBalance.lt(amountDecimal)) {
    logger.error('Confirmation failed: Payer has insufficient locked balance', {
      payerVpa,
      payeeVpa,
      amount: amountDecimal.toString(),
      lockedBalance: payerLockedBalance.toString(),
    });
    throw new BadRequestError(
      'Confirmation failed: Payer has insufficient locked balance'
    );
  }

  // Calculate new balances using Decimal arithmetic
  const newPayerLockedBalance = payerLockedBalance.minus(amountDecimal);
  const payeeBalance = new Decimal(payeeWallet.balance);
  const newPayeeBalance = payeeBalance.plus(amountDecimal);

  // Update both wallets atomically
  await Promise.all([
    tx.wallet.update({
      where: { userId: payerVpaRecord.userId },
      data: {
        lockedBalance: newPayerLockedBalance,
      },
    }),
    tx.wallet.update({
      where: { userId: payeeVpaRecord.userId },
      data: {
        balance: newPayeeBalance,
      },
    }),
  ]);

  logger.info('Transaction balance confirmed and released successfully', {
    payerVpa,
    payeeVpa,
    amount: amountDecimal.toString(),
  });
};

/**
 * Rollback transaction balance (Release locked funds back to payer)
 * - Decrements amount from payer's lockedBalance
 * - Increments amount back into payer's balance
 * - Called when NPCI webhook returns FAILED
 * 
 * @param tx - Prisma transaction client for atomicity
 * @param payerVpa - VPA of the payer
 * @param payeeVpa - VPA of the payee (for logging purposes)
 * @param amount - Transaction amount to rollback
 */
export const rollbackTransactionBalance = async (
  tx: Prisma.TransactionClient,
  payerVpa: string,
  payeeVpa: string,
  amount: number | Decimal
): Promise<void> => {
  const amountDecimal = typeof amount === 'number' ? new Decimal(amount) : amount;

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

  const payerWallet = payerVpaRecord.user.wallet;

  // Validate payer has enough locked balance
  const payerLockedBalance = new Decimal(payerWallet.lockedBalance || 0);
  if (payerLockedBalance.lt(amountDecimal)) {
    logger.error('Rollback failed: Payer has insufficient locked balance', {
      payerVpa,
      payeeVpa,
      amount: amountDecimal.toString(),
      lockedBalance: payerLockedBalance.toString(),
    });
    throw new BadRequestError(
      'Rollback failed: Payer has insufficient locked balance'
    );
  }

  // Calculate new balances using Decimal arithmetic
  const payerBalance = new Decimal(payerWallet.balance);
  const newPayerBalance = payerBalance.plus(amountDecimal);
  const newPayerLockedBalance = payerLockedBalance.minus(amountDecimal);

  // Update payer wallet: release locked balance back to available balance
  await tx.wallet.update({
    where: { userId: payerVpaRecord.userId },
    data: {
      balance: newPayerBalance,
      lockedBalance: newPayerLockedBalance,
    },
  });

  logger.info('Transaction balance rolled back successfully', {
    payerVpa,
    payeeVpa,
    amount: amountDecimal.toString(),
  });
};
