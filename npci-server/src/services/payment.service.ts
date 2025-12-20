import { config } from '../config';
import logger from '../utils/logger.util';

export interface ProcessPaymentRequest {
  pspTransactionId: string;
  amount: number;
  payerVpa: string;
  payeeVpa: string;
}

export interface ProcessPaymentResponse {
  status: 'approved' | 'rejected';
  message: string;
  npciTransactionId?: string;
  processedAt: string;
}

const REJECTION_REASONS = [
  'Insufficient funds',
  'Invalid payee VPA',
  'Network timeout',
  'Transaction limit exceeded',
  'Payment processing failed',
];

/**
 * Generate a random NPCI transaction ID
 */
const generateNpciTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `NPCI${timestamp}${random}`;
};

/**
 * Generate a random rejection reason
 */
const getRandomRejectionReason = (): string => {
  return REJECTION_REASONS[Math.floor(Math.random() * REJECTION_REASONS.length)];
};

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Validate payment request payload
 */
const validateRequest = (data: ProcessPaymentRequest): { valid: boolean; error?: string } => {
  if (!data.pspTransactionId || typeof data.pspTransactionId !== 'string' || data.pspTransactionId.trim() === '') {
    return { valid: false, error: 'pspTransactionId is required and must be a non-empty string' };
  }

  if (typeof data.amount !== 'number' || isNaN(data.amount) || data.amount <= 0) {
    return { valid: false, error: 'amount must be a positive number' };
  }

  if (!data.payerVpa || typeof data.payerVpa !== 'string' || data.payerVpa.trim() === '') {
    return { valid: false, error: 'payerVpa is required and must be a non-empty string' };
  }

  if (!data.payeeVpa || typeof data.payeeVpa !== 'string' || data.payeeVpa.trim() === '') {
    return { valid: false, error: 'payeeVpa is required and must be a non-empty string' };
  }

  // Basic VPA format validation
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  if (!vpaRegex.test(data.payerVpa)) {
    return { valid: false, error: 'Invalid payerVpa format' };
  }

  if (!vpaRegex.test(data.payeeVpa)) {
    return { valid: false, error: 'Invalid payeeVpa format' };
  }

  return { valid: true };
};

/**
 * Process payment request
 * Simulates payment clearing with configurable delay and success rate
 */
export const processPayment = async (
  data: ProcessPaymentRequest
): Promise<ProcessPaymentResponse> => {
  const startTime = Date.now();

  // Validate request
  const validation = validateRequest(data);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  logger.info('Payment request received', {
    pspTransactionId: data.pspTransactionId,
    amount: data.amount,
    payerVpa: data.payerVpa,
    payeeVpa: data.payeeVpa,
  });

  // Generate random processing delay
  const delay = Math.floor(
    Math.random() * (config.maxProcessingDelayMs - config.minProcessingDelayMs + 1) +
      config.minProcessingDelayMs
  );

  // Simulate processing delay
  await sleep(delay);

  // Determine approval/rejection based on success rate
  const random = Math.random();
  const isApproved = random < config.successRate;

  const processedAt = new Date().toISOString();

  if (isApproved) {
    const npciTransactionId = generateNpciTransactionId();
    const processingTime = Date.now() - startTime;

    logger.info('Payment approved', {
      pspTransactionId: data.pspTransactionId,
      npciTransactionId,
      processingTimeMs: processingTime,
    });

    return {
      status: 'approved',
      message: 'Payment processed successfully',
      npciTransactionId,
      processedAt,
    };
  } else {
    const rejectionReason = getRandomRejectionReason();
    const processingTime = Date.now() - startTime;

    logger.warn('Payment rejected', {
      pspTransactionId: data.pspTransactionId,
      reason: rejectionReason,
      processingTimeMs: processingTime,
    });

    return {
      status: 'rejected',
      message: rejectionReason,
      processedAt,
    };
  }
};

