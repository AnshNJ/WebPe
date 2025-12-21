import { config } from '../config';
import logger from '../utils/logger.util';
import axios from 'axios';

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
 * Simulates NPCI payment flow:
 * 1. Immediate acknowledgment of receipt
 * 2. Asynchronous processing with delay
 * 3. Callback to PSP with final status
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

  // Generate NPCI transaction ID immediately for acknowledgment
  const npciTransactionId = generateNpciTransactionId();

  // Log payment request receipt
  logger.info('Payment request received', {
    pspTransactionId: data.pspTransactionId,
    npciTransactionId,
    amount: data.amount,
    payerVpa: data.payerVpa,
    payeeVpa: data.payeeVpa,
  });

  // Start asynchronous processing (fire and forget)
  // Don't await - this allows immediate response to PSP
  processPaymentAsync(data, npciTransactionId, startTime).catch((error) => {
    logger.error('Error in async payment processing', {
      pspTransactionId: data.pspTransactionId,
      npciTransactionId,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  // Return immediate acknowledgment
  return {
    status: 'approved', // Acknowledgment - actual status will come via callback
    message: 'Payment request received and processing',
    npciTransactionId,
    processedAt: new Date().toISOString(),
  };
};

/**
 * Asynchronously process payment and send callback to PSP
 * This simulates the actual NPCI bank handshake and processing
 */
const processPaymentAsync = async (
  data: ProcessPaymentRequest,
  npciTransactionId: string,
  startTime: number
): Promise<void> => {
  // Generate random processing delay (simulating bank processing time)
  const delay = Math.floor(
    Math.random() * (config.maxProcessingDelayMs - config.minProcessingDelayMs + 1) +
      config.minProcessingDelayMs
  );

  logger.info('Processing payment', {
    pspTransactionId: data.pspTransactionId,
    npciTransactionId,
    estimatedDelayMs: delay,
  });

  // Simulate processing delay
  await sleep(delay);

  // Determine approval/rejection based on success rate
  const random = Math.random();
  const isApproved = random < config.successRate;
  const finalStatus = isApproved ? 'SUCCESS' : 'FAILED';

  const processingTime = Date.now() - startTime;

  if (isApproved) {
    logger.info('Payment approved', {
      pspTransactionId: data.pspTransactionId,
      npciTransactionId,
      processingTimeMs: processingTime,
    });
  } else {
    const rejectionReason = getRandomRejectionReason();
    logger.warn('Payment rejected', {
      pspTransactionId: data.pspTransactionId,
      npciTransactionId,
      reason: rejectionReason,
      processingTimeMs: processingTime,
    });
  }

  // Send callback to PSP server
  try {
    // Note: PSP callback endpoint is /api/v1/transactions/callback
    // It expects: { transactionId: number | string, finalStatus: 'SUCCESS' | 'FAILED' | 'TIMEOUT' }
    // The transactionId can be numeric ID or clientTransactionId (string)
    // PSP will lookup by both id and clientTransactionId
    const callbackUrl = `${config.pspApiUrl}/transactions/callback`;
    
    // Try to parse as number, but send as-is if it's not numeric (PSP should handle lookup)
    const transactionId = /^\d+$/.test(data.pspTransactionId) 
      ? parseInt(data.pspTransactionId, 10) 
      : data.pspTransactionId;
    
    await axios.post(callbackUrl, {
      transactionId: transactionId,
      finalStatus: finalStatus,
      npciRefId: npciTransactionId,
    });

    logger.info('Callback sent to PSP successfully', {
      pspTransactionId: data.pspTransactionId,
      npciTransactionId,
      status: finalStatus,
      callbackUrl,
    });
  } catch (error) {
    logger.error('Error sending callback to PSP', {
      pspTransactionId: data.pspTransactionId,
      npciTransactionId,
      error: error instanceof Error ? error.message : String(error),
      callbackUrl: `${config.pspApiUrl}/transactions/callback`,
    });
  }
};
