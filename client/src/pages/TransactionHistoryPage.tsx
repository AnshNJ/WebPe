import React from 'react';
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
} from '@mui/material';

const TransactionHistoryPage: React.FC = () => {
  // Placeholder transaction data
  const transactions = [
    { id: 1, amount: -100, to: 'example@upi', date: '2024-01-15', status: 'SUCCESS' },
    { id: 2, amount: 500, from: 'another@upi', date: '2024-01-14', status: 'SUCCESS' },
    { id: 3, amount: -250, to: 'merchant@upi', date: '2024-01-13', status: 'SUCCESS' },
    { id: 4, amount: -50, to: 'friend@upi', date: '2024-01-12', status: 'FAILED' },
    { id: 5, amount: 1000, from: 'salary@upi', date: '2024-01-10', status: 'SUCCESS' },
  ];

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? 'success' : 'error';
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Transaction History
      </Typography>
      <Card>
        <CardContent>
          <List>
            {transactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default TransactionHistoryPage;

