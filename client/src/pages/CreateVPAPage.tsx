import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiRequest, parseResponse } from '../utils/api.util';
import { useAuth } from '../contexts/AuthContext';

const CreateVPAPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const [vpa, setVpa] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic validation
    if (!vpa) {
      setError('Please provide a VPA');
      return;
    }

    // VPA format validation (should be like username@paytm or username@upi)
    const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!vpaRegex.test(vpa)) {
      setError('Invalid VPA format. Use format: username@provider');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/vpas', {
        method: 'POST',
        body: JSON.stringify({ vpa: vpa.trim() }),
      });

      await parseResponse(response);

      // Refresh user data to get updated VPAs
      await refreshUserData();

      setSuccess(true);
      setVpa('');

      // Redirect to manage VPAs page after 2 seconds
      setTimeout(() => {
        navigate('/manage-vpas');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create VPA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4, maxWidth: 600 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Create VPA
      </Typography>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                VPA created successfully!
              </Alert>
            )}
            <TextField
              fullWidth
              label="VPA (Virtual Payment Address)"
              placeholder="username@webpe"
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              margin="normal"
              required
              helperText="Format: username@provider (e.g., john@webpe)"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create VPA'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateVPAPage;

