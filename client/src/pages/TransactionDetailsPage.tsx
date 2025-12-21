import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiRequest, parseResponse } from '../utils/api.util';
import { useAuth } from '../contexts/AuthContext';

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vpas } = useAuth();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTransactionDetails();
    }
  }, [id]);

  const loadTransactionDetails = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/transactions/${id}`);
      const data = await parseResponse<{ transaction: any }>(response);

      const userVpaList = vpas.map((v: any) => v.address);
      const isPayer = userVpaList.includes(data.transaction.payerVpa);
      const amountValue = parseFloat(data.transaction.amount.toString());

      setTransaction({
        id: data.transaction.id,
        amount: isPayer ? -amountValue : amountValue,
        to: data.transaction.payeeVpa,
        from: data.transaction.payerVpa,
        date: new Date(data.transaction.createdAt).toISOString().split('T')[0],
        status: data.transaction.status,
        type: 'PAYMENT',
        clientTransactionId: data.transaction.clientTransactionId,
        createdAt: data.transaction.createdAt,
        updatedAt: data.transaction.updatedAt,
      });
    } catch (err) {
      setError('Failed to load transaction details');
      console.error('Error loading transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'warning';
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !transaction) {
    return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/transactions')}
          sx={{ mb: 3 }}
        >
          Back to Transactions
        </Button>
        <Alert severity="error">{error || 'Transaction not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/transactions')}
        sx={{ mb: 3 }}
      >
        Back to Transactions
      </Button>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Transaction Details
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Transaction ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {transaction.id}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: transaction.amount > 0 ? 'success.main' : 'text.primary',
                }}
              >
                {transaction.amount > 0 ? '+' : '-'}₹{Math.abs(transaction.amount)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={transaction.status}
                color={getStatusColor(transaction.status)}
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                From
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {transaction.from}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                To
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {transaction.to}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {transaction.date}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {transaction.type}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TransactionDetailsPage;

