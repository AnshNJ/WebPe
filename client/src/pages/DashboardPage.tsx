import React, { useState } from 'react';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Link,
  ListItem,
  ListItemText,
  List,
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentDialog from '../components/PaymentDialog';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { balance, vpas } = useAuth();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  // Mock data - replace with actual API calls
  const totalTransactions = 47;
  const successRate = 95.7; // percentage
  const recentTransactions = [
    { id: 1, amount: -100, to: 'example@upi', date: '2024-01-15', status: 'SUCCESS' },
    { id: 2, amount: 500, from: 'another@upi', date: '2024-01-14', status: 'SUCCESS' },
    { id: 3, amount: -250, to: 'merchant@upi', date: '2024-01-13', status: 'SUCCESS' },
  ];

  const handleOpenPaymentDialog = () => {
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };

  const handleTransactionClick = (transactionId: number) => {
    navigate(`/transactions/${transactionId}`);
  };

  const getStatusColor = (status: string) => {
    return status === 'SUCCESS' ? 'success' : 'error';
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Balance Card */}
          <Grid item xs={12}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.2) 0%, rgba(244, 143, 177, 0.2) 100%)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Account Balance
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <AccountBalanceWalletIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats Cards */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {totalTransactions}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {successRate}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalanceWalletIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Active VPAs
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {vpas.length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Actions Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mr: 2, mb: 1 }}
                  onClick={handleOpenPaymentDialog}
                >
                  Pay by UPI
                </Button>
                <Button
                  variant="outlined"
                  sx={{ mr: 2, mb: 1 }}
                  onClick={() => navigate('/send-money')}
                >
                  Send Money
                </Button>
                <Button
                  variant="outlined"
                  sx={{ mb: 1 }}
                  onClick={() => navigate('/request-money')}
                >
                  Request Money
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="div">
                    Recent Transactions
                  </Typography>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/transactions')}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    View All
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Link>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {recentTransactions.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {recentTransactions.map((transaction, index) => (
                      <React.Fragment key={transaction.id}>
                        <ListItem
                          button
                          onClick={() => handleTransactionClick(transaction.id)}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 500,
                                    color: transaction.amount > 0 ? 'success.main' : 'text.primary',
                                  }}
                                >
                                  {transaction.amount > 0 ? '+' : '-'}₹{Math.abs(transaction.amount)}
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
                        {index < recentTransactions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No recent transactions
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <PaymentDialog
        open={openPaymentDialog}
        onClose={handleClosePaymentDialog}
      />
    </Box>
  );
};

export default DashboardPage;
