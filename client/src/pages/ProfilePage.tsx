import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_BASE_URL = 'http://localhost:3001/api';

interface VPA {
  id: string;
  address: string;
  displayName: string;
  isPrimary: boolean;
  createdAt: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  accountCreated: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [vpas, setVpas] = useState<VPA[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vpaToDelete, setVpaToDelete] = useState<VPA | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with actual endpoints when available
      // const [balanceRes, vpasRes, userRes, transactionsRes] = await Promise.all([
      //   fetch(`${API_BASE_URL}/user/balance`),
      //   fetch(`${API_BASE_URL}/user/vpas`),
      //   fetch(`${API_BASE_URL}/user/profile`),
      //   fetch(`${API_BASE_URL}/transactions/count`),
      // ]);

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

      setBalance(12500.50);
      setVpas([
        {
          id: 'vpa_1',
          address: 'user@webpe',
          displayName: 'John Doe',
          isPrimary: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'vpa_2',
          address: 'john@webpe',
          displayName: 'John Doe',
          isPrimary: false,
          createdAt: '2024-01-15T00:00:00Z',
        },
      ]);
      setUserInfo({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        accountCreated: '2024-01-01T00:00:00Z',
      });
      setTotalTransactions(47);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVpa = (vpa: VPA) => {
    if (vpa.isPrimary) {
      setError('Cannot delete primary VPA. Set another VPA as primary first.');
      return;
    }
    setVpaToDelete(vpa);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVpa = async () => {
    if (!vpaToDelete) return;

    setDeleting(true);
    try {
      // Mock API call - replace with actual endpoint when available
      // await fetch(`${API_BASE_URL}/vpas/${vpaToDelete.id}`, {
      //   method: 'DELETE',
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setVpas((prev) => prev.filter((v) => v.id !== vpaToDelete.id));
      setDeleteDialogOpen(false);
      setVpaToDelete(null);
    } catch (err) {
      setError('Failed to delete VPA');
      console.error('Error deleting VPA:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon />
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Account Balance Card */}
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

        {/* User Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon />
                User Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {userInfo && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {userInfo.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {userInfo.email}
                      </Typography>
                    </Box>
                  </Box>
                  {userInfo.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {userInfo.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Account Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                Account Statistics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon fontSize="small" color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalTransactions}
                    </Typography>
                  </Box>
                </Box>
                {userInfo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Account Created
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(userInfo.accountCreated)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" color="action" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Active VPAs
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {vpas.length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* VPAs List Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon />
                  Virtual Payment Addresses (VPAs)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/manage-vpa')}
                    size="small"
                  >
                    Manage VPAs
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/create-vpa')}
                    size="small"
                  >
                    Create VPA
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {vpas.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {vpas.map((vpa, index) => (
                    <React.Fragment key={vpa.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          px: 2,
                          borderRadius: 1,
                          mb: 1,
                          backgroundColor: vpa.isPrimary ? 'action.selected' : 'transparent',
                          border: vpa.isPrimary ? '1px solid' : 'none',
                          borderColor: vpa.isPrimary ? 'primary.main' : 'transparent',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {vpa.address}
                              </Typography>
                              {vpa.isPrimary && (
                                <Chip
                                  icon={<StarIcon />}
                                  label="Primary"
                                  size="small"
                                  color="primary"
                                  sx={{ height: 24 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {vpa.displayName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created: {formatDate(vpa.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteVpa(vpa)}
                          color="error"
                          disabled={vpa.isPrimary}
                          title={vpa.isPrimary ? 'Cannot delete primary VPA' : 'Delete VPA'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                      {index < vpas.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No VPAs found
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/create-vpa')}
                  >
                    Create Your First VPA
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete VPA Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete VPA</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the VPA <strong>{vpaToDelete?.address}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteVpa}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;

