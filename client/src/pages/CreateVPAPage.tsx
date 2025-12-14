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
} from '@mui/material';

const CreateVPAPage: React.FC = () => {
  const [vpa, setVpa] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic validation
    if (!vpa || !name) {
      setError('Please fill in all fields');
      return;
    }

    // VPA format validation (should be like username@paytm or username@upi)
    const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!vpaRegex.test(vpa)) {
      setError('Invalid VPA format. Use format: username@provider');
      return;
    }

    // Simulate VPA creation
    setTimeout(() => {
      setSuccess(true);
      setVpa('');
      setName('');
    }, 500);
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
            />
            <TextField
              fullWidth
              label="Display Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
            >
              Create VPA
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateVPAPage;

