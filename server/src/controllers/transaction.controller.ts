import { Request, Response } from 'express';
import prisma from '../utils/prisma.util';
import { TransactionStatus } from '../interfaces/transaction.interface';
import { TransactionStatus as PrismaTransactionStatus } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import { NotFoundError, BadRequestError, UnauthenticatedError, ForbiddenError } from '../errors';
import { processTransactionBalance, confirmTransactionBalance, rollbackTransactionBalance } from '../services/wallet.service';
import logger from '../utils/logger.util';

const getTransactions = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new UnauthenticatedError("Unauthorized");
  }

  // Get user's VPAs to filter transactions
  const userVpas = await prisma.vpa.findMany({
    where: { userId: Number(user.userId) },
    select: { vpa: true }
  });
  const vpaList = userVpas.map((v: { vpa: string }) => v.vpa);

  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { payerVpa: { in: vpaList } },
        { payeeVpa: { in: vpaList } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(StatusCodes.OK).json({ message: 'Transactions fetched successfully', transactions });
};


const getTransactionDetails = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new UnauthenticatedError("Unauthorized");
  }

  const { id } = req.params;
  const transactionId = Number(id);
  
  if (isNaN(transactionId) || transactionId <= 0) {
    throw new BadRequestError("Invalid transaction ID");
  }

  const transaction = await prisma.transaction.findUnique({ 
    where: { id: transactionId } 
  });

  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }

  // Verify user owns this transaction (is payer or payee)
  const userVpas = await prisma.vpa.findMany({
    where: { userId: Number(user.userId) },
    select: { vpa: true }
  });
  const vpaList = userVpas.map((v: { vpa: string }) => v.vpa);

  if (!vpaList.includes(transaction.payerVpa) && !vpaList.includes(transaction.payeeVpa)) {
    throw new ForbiddenError("You don't have permission to view this transaction");
  }

  res.status(StatusCodes.OK).json({ message: 'Transaction details fetched successfully', transaction });
};


const getTransactionStatus = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new UnauthenticatedError("Unauthorized");
  }

  const { id } = req.params;
  const transactionId = Number(id);
  
  if (isNaN(transactionId) || transactionId <= 0) {
    throw new BadRequestError("Invalid transaction ID");
  }

  const transaction = await prisma.transaction.findUnique({ 
    where: { id: transactionId } 
  });

  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }

  // Verify user owns this transaction
  const userVpas = await prisma.vpa.findMany({
    where: { userId: Number(user.userId) },
    select: { vpa: true }
  });
  const vpaList = userVpas.map((v: { vpa: string }) => v.vpa);

  if (!vpaList.includes(transaction.payerVpa) && !vpaList.includes(transaction.payeeVpa)) {
    throw new ForbiddenError("You don't have permission to view this transaction");
  }

  res.status(StatusCodes.OK).json({ message: 'Transaction status fetched successfully', status: transaction.status });
};

const getTransactionCountByStatus = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new UnauthenticatedError("Unauthorized");
  }

  const { status } = req.query;
  
  // Get user's VPAs to filter transactions
  const userVpas = await prisma.vpa.findMany({
    where: { userId: Number(user.userId) },
    select: { vpa: true }
  });
  const vpaList = userVpas.map((v: { vpa: string }) => v.vpa);

  const count = await prisma.transaction.count({ 
    where: { 
      AND: [
        { status: status as PrismaTransactionStatus },
        {
          OR: [
            { payerVpa: { in: vpaList } },
            { payeeVpa: { in: vpaList } }
          ]
        }
      ]
    } 
  });

  res.status(StatusCodes.OK).json({ message: 'Transaction count fetched successfully', count });
};

/**
 * Create a new transaction and process wallet balance updates
 * This endpoint:
 * 1. Validates the transaction request
 * 2. Creates transaction record with PENDING status
 * 3. Creates transaction record in database and earmarks balance
 */
  const createTransaction = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new UnauthenticatedError("Unauthorized");
    }
    const { amount, payeeVpa, payerVpa, clientTransactionId } = req.body;

    if (!amount || !payeeVpa || !payerVpa || !clientTransactionId) {
      throw new BadRequestError("Please provide amount, payeeVpa, payerVpa, and clientTransactionId");
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { clientTransactionId }
    });
    
    if (existingTransaction) {
      logger.warn('Duplicate request detected via clientTransactionId', { clientTransactionId });
      return res.status(StatusCodes.OK).json({ 
        message: `Transaction already processed or pending. Status: ${existingTransaction.status}`,
        transaction: existingTransaction,
      });
    }
    
    try {
      const pendingTransaction = await prisma.$transaction(async (tx) => {
        // Earmark balance: debit payer balance and add to lockedBalance
        await processTransactionBalance(tx, payerVpa, payeeVpa, amount);
        
        // Create transaction record atomically
        const transaction = await tx.transaction.create({
          data: {
            clientTransactionId,
            amount,
            payeeVpa,
            payerVpa,
            status: TransactionStatus.PENDING,
            userId: Number(user.userId)
          }
        });
        
        return transaction;
      })
      
     // await callExternalUPIApi(pendingTransaction.id, payerVpa, payeeVpa, amount);
     logger.info('Transaction created and balance earmarked successfully', { transactionId: pendingTransaction.id, payerVpa, payeeVpa, amount });

     res.status(StatusCodes.ACCEPTED).json({ 
      message: 'Transaction initiated. Awaiting final status confirmation.', 
      transactionId: pendingTransaction.id 
    });
    } catch (error) {
      throw new BadRequestError("Failed to initiate transaction. Please try again.");
    }
  };

  const processTransactionCallback = async (req: Request, res: Response) => {
    const { transactionId, finalStatus } = req.body;
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });
    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      res.status(StatusCodes.OK).json({ message: 'Transaction not found or already processed' });
      return;
    }

    try {
      if(finalStatus === TransactionStatus.SUCCESS) {
        // Confirm transaction: release locked balance and credit payee
        await prisma.$transaction(async (tx) => {
          await confirmTransactionBalance(tx, transaction.payerVpa, transaction.payeeVpa, transaction.amount);
          
          await tx.transaction.update({
            where: { id: transactionId },
            data: { status: TransactionStatus.SUCCESS }
          });
        });
        
        logger.info(`Transaction ${transactionId} successfully confirmed by external system`);
      } else if(finalStatus === TransactionStatus.FAILED || finalStatus === TransactionStatus.TIMEOUT) {
        // Rollback transaction: release locked balance back to payer
        await prisma.$transaction(async (tx) => {
          await rollbackTransactionBalance(tx, transaction.payerVpa, transaction.payeeVpa, transaction.amount);
          
          await tx.transaction.update({
            where: { id: transactionId },
            data: { status: TransactionStatus.FAILED}
          });
        });
        
        logger.info(`Transaction ${transactionId} failed or timed out. Balance rolled back successfully`);
      }

      res.status(StatusCodes.OK).json({ message: 'Callback processed successfully', status: finalStatus });
    } catch (error) {
      logger.error(`Error processing transaction callback for transaction ${transactionId}:`, error);
      throw new BadRequestError('Failed to process transaction callback');
    }
  };

export { 
  getTransactions, 
  getTransactionDetails, 
  getTransactionStatus, 
  getTransactionCountByStatus,
  createTransaction,
  processTransactionCallback 
};