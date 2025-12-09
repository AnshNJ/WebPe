import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import PaymentDialog from '../components/PaymentDialog';

const DashboardPage: React.FC = () => {
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  const handleOpenPaymentDialog = () => {
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PSP Dashboard
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Main Actions Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ mb: 2 }}>
                  Actions
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mr: 2 }}
                  onClick={handleOpenPaymentDialog}
                >
                  Pay by UPI
                </Button>
                <Button variant="outlined" sx={{ mr: 2 }}>
                  Send Money
                </Button>
                <Button variant="outlined">Request Money</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  Recent Transactions
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {/* Placeholder for transactions */}
                  <Typography>Transaction 1: -₹100 to example@upi</Typography>
                  <Typography>Transaction 2: +₹500 from another@upi</Typography>
                  <Typography>Transaction 3: -₹250 to merchant@upi</Typography>
                </Box>
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
