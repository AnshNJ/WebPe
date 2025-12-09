import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import Payment from './Payment';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Initiate Payment</DialogTitle>
      <DialogContent>
        <Payment />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
