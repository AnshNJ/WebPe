import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiRequest, parseResponse } from '../utils/api.util';
import { useAuth } from '../contexts/AuthContext';

const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { vpas } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/transactions');
      const data = await parseResponse<{ transactions: any[] }>(response);

      const userVpaList = vpas.map((v: any) => v.address);
      const mappedTransactions = data.transactions.map((tx: any) => {
        const isPayer = userVpaList.includes(tx.payerVpa);
        const amountValue = parseFloat(tx.amount.toString());
        
        return {
          id: tx.id,
          amount: isPayer ? -amountValue : amountValue,
          to: tx.payeeVpa,
          from: tx.payerVpa,
          date: new Date(tx.createdAt).toISOString().split('T')[0],
          status: tx.status,
        };
      });

      setTransactions(mappedTransactions);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Transaction History
      </Typography>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      <Card>
        <CardContent>
          {transactions.length === 0 ? (
            <Typography color="text.secondary">No transactions found</Typography>
          ) : (
            <List>
              {transactions.map((transaction) => (
                <ListItem
                  key={transaction.id}
                  button
                  onClick={() => navigate(`/transactions/${transaction.id}`)}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.amount > 0
                          ? `From: ${transaction.from}`
                          : `To: ${transaction.to}`}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {transaction.date}
                      </Typography>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TransactionHistoryPage;

