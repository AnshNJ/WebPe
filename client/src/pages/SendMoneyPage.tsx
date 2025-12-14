import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  MenuItem,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const API_BASE_URL = 'http://localhost:3001/api';

interface FormErrors {
  recipientVpa?: string;
  amount?: string;
  payerVpa?: string;
}

const SendMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const [recipientVpa, setRecipientVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [payerVpa, setPayerVpa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Mock user VPAs - replace with actual API call to get user's VPAs
  const userVPAs = [
    { value: 'user@webpe', label: 'user@webpe (Primary)' },
    { value: 'john@webpe', label: 'john@webpe' },
  ];

  // VPA validation regex
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate recipient VPA
    if (!recipientVpa.trim()) {
      newErrors.recipientVpa = 'Recipient VPA is required';
    } else if (!vpaRegex.test(recipientVpa.trim())) {
      newErrors.recipientVpa = 'Invalid VPA format. Use format: username@provider';
    } else if (recipientVpa.trim() === payerVpa) {
      newErrors.recipientVpa = 'Recipient VPA cannot be the same as sender VPA';
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

    // Validate payer VPA
    if (!payerVpa) {
      newErrors.payerVpa = 'Please select a sender VPA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payeeVpa: recipientVpa.trim(),
          payerVpa: payerVpa,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send money');
      }

      setSuccess(true);
      setTransactionId(data.id);

      // Redirect after 2 seconds
      setTimeout(() => {
        if (data.id) {
          navigate(`/transactions/${data.id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending money');
    } finally {
      setLoading(false);
    }
  };

  // Set default payer VPA on mount
  React.useEffect(() => {
    if (userVPAs.length > 0 && !payerVpa) {
      setPayerVpa(userVPAs[0].value);
    }
  }, []);

  return (
    <Container sx={{ mt: 4, mb: 4, maxWidth: 600 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SendIcon />
        Send Money
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Money sent successfully! Redirecting to transaction details...
              </Alert>
            )}

            <TextField
              fullWidth
              label="Sender VPA"
              select
              value={payerVpa}
              onChange={(e) => setPayerVpa(e.target.value)}
              margin="normal"
              required
              error={!!errors.payerVpa}
              helperText={errors.payerVpa || 'Select the VPA to send money from'}
              disabled={loading}
            >
              {userVPAs.map((vpa) => (
                <MenuItem key={vpa.value} value={vpa.value}>
                  {vpa.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Recipient VPA"
              placeholder="recipient@webpe"
              value={recipientVpa}
              onChange={(e) => setRecipientVpa(e.target.value)}
              margin="normal"
              required
              error={!!errors.recipientVpa}
              helperText={errors.recipientVpa || 'Enter the recipient\'s VPA address'}
              disabled={loading}
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
                // Allow only positive numbers with up to 2 decimal places
                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                  setAmount(value);
                }
              }}
              margin="normal"
              required
              error={!!errors.amount}
              helperText={errors.amount || 'Enter the amount to send (₹1 - ₹1,00,000)'}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{
                min: 1,
                max: 100000,
                step: 0.01,
              }}
            />

            <TextField
              fullWidth
              label="Note (Optional)"
              placeholder="Add a note for this transaction"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              margin="normal"
              multiline
              rows={3}
              disabled={loading}
              helperText="Add a personal note for your reference"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || success}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ py: 1.5 }}
              >
                {loading ? 'Sending...' : success ? 'Sent!' : 'Send Money'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Cancel
              </Button>
            </Box>

            {transactionId && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Transaction ID: {transactionId}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SendMoneyPage;

