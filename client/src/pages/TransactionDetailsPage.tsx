import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Mock transaction data - replace with API call
  const transaction = {
    id: id,
    amount: -100,
    to: 'example@upi',
    from: 'user@webpe',
    date: '2024-01-15',
    status: 'SUCCESS',
    type: 'PAYMENT',
  };

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? 'success' : 'error';
  };

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

