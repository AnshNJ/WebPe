import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Typography,
  LinearProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { apiRequest, parseResponse, generateClientTransactionId } from '../utils/api.util';
import { useAuth } from '../contexts/AuthContext';

interface PaymentProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface FormErrors {
  payerVpa?: string;
  payeeVpa?: string;
  amount?: string;
}

const Payment: React.FC<PaymentProps> = ({ onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { vpas } = useAuth();
  const [payerVpa, setPayerVpa] = useState('');
  const [payeeVpa, setPayeeVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'INITIATING' | 'PENDING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const MAX_POLLING_ATTEMPTS = 30; // 1 minute max (30 * 2 seconds)

  // Get user VPAs from auth context
  const userVPAs = vpas.map((vpa) => ({
    value: vpa.address,
    label: `${vpa.address}${vpa.isPrimary ? ' (Primary)' : ''}`,
  }));

  // VPA validation regex
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

  // Set default payer VPA on mount
  useEffect(() => {
    if (userVPAs.length > 0 && !payerVpa) {
      setPayerVpa(userVPAs[0].value);
    }
  }, []);

  // Polling effect for transaction status
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (transactionId && paymentStatus === 'PENDING' && pollingAttempts < MAX_POLLING_ATTEMPTS) {
      interval = setInterval(async () => {
        try {
          const response = await apiRequest(`/transactions/${transactionId}/status`);
          const data = await parseResponse<{ status: string; message: string }>(response);
          
          setPollingAttempts((prev) => prev + 1);

          if (data.status === 'SUCCESS' || data.status === 'FAILED') {
            const currentTransactionId = transactionId;
            setPaymentStatus(data.status);
            if (interval) clearInterval(interval);

            if (data.status === 'SUCCESS') {
              // Call success callback or navigate after a delay
              setTimeout(() => {
                if (onSuccess) {
                  onSuccess();
                } else if (onClose && currentTransactionId) {
                  onClose();
                  navigate(`/transactions/${currentTransactionId}`);
                }
              }, 2000);
            } else {
              setTransactionId(null);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
          if (pollingAttempts >= MAX_POLLING_ATTEMPTS - 1) {
            setError('Transaction status check timed out. Please check transaction history.');
            setPaymentStatus('FAILED');
            if (interval) clearInterval(interval);
          }
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [transactionId, paymentStatus, pollingAttempts, onSuccess, onClose, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate payer VPA
    if (!payerVpa.trim()) {
      newErrors.payerVpa = 'Payer VPA is required';
    } else if (!vpaRegex.test(payerVpa.trim())) {
      newErrors.payerVpa = 'Invalid VPA format';
    }

    // Validate payee VPA
    if (!payeeVpa.trim()) {
      newErrors.payeeVpa = 'Payee VPA is required';
    } else if (!vpaRegex.test(payeeVpa.trim())) {
      newErrors.payeeVpa = 'Invalid VPA format. Use format: username@provider';
    } else if (payeeVpa.trim() === payerVpa) {
      newErrors.payeeVpa = 'Payee VPA cannot be the same as payer VPA';
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      } else if (amountNum < 1) {
        newErrors.amount = 'Minimum amount is ₹1';
      } else if (amountNum > 100000) {
        newErrors.amount = 'Maximum amount is ₹1,00,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPaymentStatus('IDLE');

    if (!validateForm()) {
      return;
    }

    setPaymentStatus('INITIATING');
    setPollingAttempts(0);

    try {
      // Generate client transaction ID
      const clientTransactionId = generateClientTransactionId();

      const response = await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          payeeVpa: payeeVpa.trim(),
          payerVpa: payerVpa.trim(),
          clientTransactionId,
        }),
      });

      const data = await parseResponse<{ transactionId: number; message: string }>(response);

      setPaymentStatus('PENDING');
      setTransactionId(String(data.transactionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while initiating payment');
      setPaymentStatus('FAILED');
    }
  };

  const handleReset = () => {
    setPaymentStatus('IDLE');
    setTransactionId(null);
    setError('');
    setAmount('');
    setPayeeVpa('');
    setPollingAttempts(0);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {paymentStatus === 'SUCCESS' && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleReset}>
              New Payment
            </Button>
          }
        >
          Payment successful! Transaction ID: {transactionId}
        </Alert>
      )}

      {paymentStatus === 'FAILED' && (
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleReset}>
              Try Again
            </Button>
          }
        >
          Payment failed. Please try again.
        </Alert>
      )}

      {paymentStatus === 'PENDING' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Processing payment... Please wait.
            </Typography>
            <LinearProgress />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Transaction ID: {transactionId}
          </Typography>
        </Alert>
      )}

      <TextField
        fullWidth
        label="Payer VPA"
        select
        value={payerVpa}
        onChange={(e) => setPayerVpa(e.target.value)}
        margin="normal"
        required
        error={!!errors.payerVpa}
        helperText={errors.payerVpa || 'Select the VPA to pay from'}
        disabled={paymentStatus === 'PENDING' || paymentStatus === 'INITIATING' || paymentStatus === 'SUCCESS'}
      >
        {userVPAs.map((vpa) => (
          <MenuItem key={vpa.value} value={vpa.value}>
            {vpa.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Payee VPA"
        placeholder="recipient@webpe"
        value={payeeVpa}
        onChange={(e) => setPayeeVpa(e.target.value)}
        margin="normal"
        required
        error={!!errors.payeeVpa}
        helperText={errors.payeeVpa || 'Enter the recipient\'s VPA address'}
        disabled={paymentStatus === 'PENDING' || paymentStatus === 'INITIATING' || paymentStatus === 'SUCCESS'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountBalanceWalletIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            setAmount(value);
          }
        }}
        margin="normal"
        required
        error={!!errors.amount}
        helperText={errors.amount || 'Enter the amount to pay (₹1 - ₹1,00,000)'}
        disabled={paymentStatus === 'PENDING' || paymentStatus === 'INITIATING' || paymentStatus === 'SUCCESS'}
        InputProps={{
          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
        }}
        inputProps={{
          min: 1,
          max: 100000,
          step: 0.01,
        }}
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        {onClose && (
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={paymentStatus === 'PENDING' || paymentStatus === 'INITIATING'}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={paymentStatus === 'PENDING' || paymentStatus === 'INITIATING' || paymentStatus === 'SUCCESS'}
          startIcon={
            paymentStatus === 'INITIATING' || paymentStatus === 'PENDING' ? (
              <CircularProgress size={20} />
            ) : (
              <SendIcon />
            )
          }
        >
          {paymentStatus === 'INITIATING'
            ? 'Initiating...'
            : paymentStatus === 'PENDING'
            ? 'Processing...'
            : paymentStatus === 'SUCCESS'
            ? 'Success!'
            : 'Pay'}
        </Button>
      </Box>
    </Box>
  );
};

export default Payment;
