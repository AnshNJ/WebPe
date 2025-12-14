import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import QrCodeIcon from '@mui/icons-material/QrCode';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE_URL = 'http://localhost:3001/api';

interface MoneyRequest {
  id: string;
  requestorVpa: string;
  recipientVpa: string;
  amount: number;
  note?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  requestLink?: string;
}

interface FormErrors {
  recipientVpa?: string;
  amount?: string;
  requestorVpa?: string;
}

const RequestMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const [requestorVpa, setRequestorVpa] = useState('');
  const [recipientVpa, setRecipientVpa] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pendingRequests, setPendingRequests] = useState<MoneyRequest[]>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // Mock user VPAs - replace with actual API call
  const userVPAs = [
    { value: 'user@webpe', label: 'user@webpe (Primary)' },
    { value: 'john@webpe', label: 'john@webpe' },
  ];

  // VPA validation regex
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

  // Load pending requests on mount
  useEffect(() => {
    loadPendingRequests();
    // Set default requestor VPA
    if (userVPAs.length > 0 && !requestorVpa) {
      setRequestorVpa(userVPAs[0].value);
    }
  }, []);

  const loadPendingRequests = async () => {
    try {
      // Mock API call - replace with actual endpoint when available
      // const response = await fetch(`${API_BASE_URL}/money-requests/pending`);
      // const data = await response.json();
      
      // Mock data for now
      const mockRequests: MoneyRequest[] = [
        {
          id: 'req_1',
          requestorVpa: 'user@webpe',
          recipientVpa: 'friend@webpe',
          amount: 500,
          note: 'Lunch money',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          requestLink: 'https://webpe.app/pay/req_1',
        },
        {
          id: 'req_2',
          requestorVpa: 'user@webpe',
          recipientVpa: 'colleague@webpe',
          amount: 1000,
          note: 'Shared expenses',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          requestLink: 'https://webpe.app/pay/req_2',
        },
      ];
      setPendingRequests(mockRequests);
    } catch (err) {
      console.error('Failed to load pending requests:', err);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate requestor VPA
    if (!requestorVpa.trim()) {
      newErrors.requestorVpa = 'Requestor VPA is required';
    } else if (!vpaRegex.test(requestorVpa.trim())) {
      newErrors.requestorVpa = 'Invalid VPA format';
    }

    // Validate recipient VPA
    if (!recipientVpa.trim()) {
      newErrors.recipientVpa = 'Recipient VPA is required';
    } else if (!vpaRegex.test(recipientVpa.trim())) {
      newErrors.recipientVpa = 'Invalid VPA format. Use format: username@provider';
    } else if (recipientVpa.trim() === requestorVpa) {
      newErrors.recipientVpa = 'Recipient VPA cannot be the same as requestor VPA';
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

  const generateRequestLink = (requestId: string): string => {
    // Generate a shareable link for the money request
    // In a real implementation, this would be stored in the backend
    return `${window.location.origin}/pay-request/${requestId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setRequestId(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Mock API call - replace with actual endpoint when available
      // const response = await fetch(`${API_BASE_URL}/money-requests`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     requestorVpa: requestorVpa.trim(),
      //     recipientVpa: recipientVpa.trim(),
      //     amount: parseFloat(amount),
      //     note: note.trim() || undefined,
      //   }),
      // });

      // Mock response
      const mockRequestId = `req_${Date.now()}`;
      const requestLink = generateRequestLink(mockRequestId);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newRequest: MoneyRequest = {
        id: mockRequestId,
        requestorVpa: requestorVpa.trim(),
        recipientVpa: recipientVpa.trim(),
        amount: parseFloat(amount),
        note: note.trim() || undefined,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        requestLink,
      };

      setSuccess(true);
      setRequestId(mockRequestId);
      setGeneratedLink(requestLink);

      // Add to pending requests
      setPendingRequests((prev) => [newRequest, ...prev]);

      // Show link dialog
      setShowLinkDialog(true);

      // Reset form
      setAmount('');
      setNote('');
      setRecipientVpa('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating money request');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      // Mock API call - replace with actual endpoint when available
      // await fetch(`${API_BASE_URL}/money-requests/${requestId}`, {
      //   method: 'DELETE',
      // });

      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Container sx={{ mt: 4, mb: 4, maxWidth: 900 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RequestQuoteIcon />
        Request Money
      </Typography>

      <Grid container spacing={3}>
        {/* Request Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Create Money Request
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Money request created successfully!
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Your VPA (Requestor)"
                  value={requestorVpa}
                  onChange={(e) => setRequestorVpa(e.target.value)}
                  margin="normal"
                  required
                  error={!!errors.requestorVpa}
                  helperText={errors.requestorVpa || 'Your VPA address'}
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
                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  margin="normal"
                  required
                  error={!!errors.amount}
                  helperText={errors.amount || 'Enter the amount to request (₹1 - ₹1,00,000)'}
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
                  placeholder="Add a note for this request"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  margin="normal"
                  multiline
                  rows={3}
                  disabled={loading}
                  helperText="Add a note to explain the request"
                />

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || success}
                    startIcon={loading ? <CircularProgress size={20} /> : <RequestQuoteIcon />}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? 'Creating...' : success ? 'Created!' : 'Create Request'}
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
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Requests List */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Pending Requests
              </Typography>
              {pendingRequests.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {pendingRequests.map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          py: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', width: '100%' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              ₹{request.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              To: {request.recipientVpa}
                            </Typography>
                            {request.note && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Note: {request.note}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                              <Chip
                                label={request.status}
                                size="small"
                                color={request.status === 'PENDING' ? 'warning' : 'default'}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(request.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRequest(request.id)}
                            color="error"
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        {request.requestLink && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<LinkIcon />}
                              onClick={() => {
                                setGeneratedLink(request.requestLink!);
                                setShowLinkDialog(true);
                              }}
                            >
                              Share Link
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<QrCodeIcon />}
                              disabled
                              title="QR Code generation coming soon"
                            >
                              QR Code
                            </Button>
                          </Box>
                        )}
                      </ListItem>
                      {index < pendingRequests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <RequestQuoteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No pending requests
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Request Link Dialog */}
      <Dialog open={showLinkDialog} onClose={() => setShowLinkDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Payment Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share this link with the recipient to allow them to pay your request:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              value={generatedLink}
              InputProps={{
                readOnly: true,
              }}
              size="small"
            />
            <IconButton onClick={handleCopyLink} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Box>
          {linkCopied && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Link copied to clipboard!
            </Alert>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Note: QR code generation will be available in a future update.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLinkDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RequestMoneyPage;

