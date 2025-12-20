import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API_BASE_URL = 'http://localhost:3001/api';

interface VPA {
  id: string;
  address: string;
  displayName: string;
  isPrimary: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

const ManageVPAPage: React.FC = () => {
  const navigate = useNavigate();
  const [vpas, setVpas] = useState<VPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [primaryDialogOpen, setPrimaryDialogOpen] = useState(false);
  const [vpaToDelete, setVpaToDelete] = useState<VPA | null>(null);
  const [vpaToSetPrimary, setVpaToSetPrimary] = useState<VPA | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadVPAs();
  }, []);

  const loadVPAs = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual endpoint when available
      // const response = await fetch(`${API_BASE_URL}/user/vpas`);
      // const data = await response.json();

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      setVpas([
        {
          id: 'vpa_1',
          address: 'user@webpe',
          displayName: 'John Doe',
          isPrimary: true,
          status: 'ACTIVE',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'vpa_2',
          address: 'john@webpe',
          displayName: 'John Doe',
          isPrimary: false,
          status: 'ACTIVE',
          createdAt: '2024-01-15T00:00:00Z',
        },
        {
          id: 'vpa_3',
          address: 'john.doe@webpe',
          displayName: 'John Doe',
          isPrimary: false,
          status: 'INACTIVE',
          createdAt: '2024-01-20T00:00:00Z',
        },
      ]);
    } catch (err) {
      setError('Failed to load VPAs');
      console.error('Error loading VPAs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = (vpa: VPA) => {
    if (vpa.isPrimary) {
      return;
    }
    setVpaToSetPrimary(vpa);
    setPrimaryDialogOpen(true);
  };

  const confirmSetPrimary = async () => {
    if (!vpaToSetPrimary) return;

    setSettingPrimary(true);
    try {
      // Mock API call - replace with actual endpoint when available
      // await fetch(`${API_BASE_URL}/vpas/${vpaToSetPrimary.id}/set-primary`, {
      //   method: 'PATCH',
      // });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setVpas((prev) =>
        prev.map((v) => ({
          ...v,
          isPrimary: v.id === vpaToSetPrimary.id,
        }))
      );

      setSuccess('Primary VPA updated successfully');
      setPrimaryDialogOpen(false);
      setVpaToSetPrimary(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to set primary VPA');
      console.error('Error setting primary VPA:', err);
    } finally {
      setSettingPrimary(false);
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
      setSuccess('VPA deleted successfully');
      setDeleteDialogOpen(false);
      setVpaToDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon fontSize="small" />;
      case 'INACTIVE':
        return <CancelIcon fontSize="small" />;
      case 'SUSPENDED':
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWalletIcon />
          Manage VPAs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-vpa')}
        >
          Create VPA
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {vpas.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>VPA Address</TableCell>
                  <TableCell>Display Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Primary</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vpas.map((vpa) => (
                  <TableRow
                    key={vpa.id}
                    sx={{
                      backgroundColor: vpa.isPrimary ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {vpa.address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{vpa.displayName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(vpa.status) || undefined}
                        label={vpa.status}
                        color={getStatusColor(vpa.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(vpa.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {vpa.isPrimary ? (
                        <Chip
                          icon={<StarIcon />}
                          label="Primary"
                          color="primary"
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {!vpa.isPrimary && (
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimary(vpa)}
                            color="primary"
                            title="Set as primary"
                          >
                            <StarBorderIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteVpa(vpa)}
                          color="error"
                          disabled={vpa.isPrimary}
                          title={vpa.isPrimary ? 'Cannot delete primary VPA' : 'Delete VPA'}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Card View */}
          <Grid container spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {vpas.map((vpa) => (
              <Grid item xs={12} key={vpa.id}>
                <Card
                  sx={{
                    border: vpa.isPrimary ? '2px solid' : '1px solid',
                    borderColor: vpa.isPrimary ? 'primary.main' : 'divider',
                    backgroundColor: vpa.isPrimary ? 'action.selected' : 'background.paper',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {vpa.address}
                          </Typography>
                          {vpa.isPrimary && (
                            <Chip
                              icon={<StarIcon />}
                              label="Primary"
                              color="primary"
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {vpa.displayName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={getStatusIcon(vpa.status) || undefined}
                            label={vpa.status}
                            color={getStatusColor(vpa.status) as any}
                            size="small"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(vpa.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {!vpa.isPrimary && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<StarBorderIcon />}
                          onClick={() => handleSetPrimary(vpa)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteVpa(vpa)}
                        disabled={vpa.isPrimary}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No VPAs Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first VPA to start making payments
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-vpa')}
              >
                Create VPA
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Set Primary Confirmation Dialog */}
      <Dialog open={primaryDialogOpen} onClose={() => setPrimaryDialogOpen(false)}>
        <DialogTitle>Set Primary VPA</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to set <strong>{vpaToSetPrimary?.address}</strong> as your primary VPA?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will make it the default VPA for all transactions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrimaryDialogOpen(false)} disabled={settingPrimary}>
            Cancel
          </Button>
          <Button
            onClick={confirmSetPrimary}
            variant="contained"
            disabled={settingPrimary}
            startIcon={settingPrimary ? <CircularProgress size={20} /> : <StarIcon />}
          >
            {settingPrimary ? 'Setting...' : 'Set Primary'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete VPA Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete VPA</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the VPA <strong>{vpaToDelete?.address}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. You will not be able to receive payments to this VPA.
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

export default ManageVPAPage;

