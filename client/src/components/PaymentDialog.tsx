import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import Payment from './Payment';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onClose }) => {
  const handleSuccess = () => {
    // Close dialog after successful payment
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Pay by UPI</DialogTitle>
      <DialogContent>
        <Payment onSuccess={handleSuccess} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
