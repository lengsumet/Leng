import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { TextField, Button, Container, Typography, Box, CircularProgress, Alert } from '@mui/material';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginUser, user, isLoading, error, token } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Email and password are required.');
      return;
    }

    try {
      await loginUser(email, password);
      // The redirection logic will be handled by the useEffect hook below
    } catch (err: any) {
      // Error is already set in the store by loginUser
      // If you need a specific form error that the store doesn't provide:
      // setFormError(err.message || 'Login failed. Please check your credentials.');
    }
  };
  
  useEffect(() => {
    // Redirect based on user role after successful login (user state is updated)
    if (token && user) { // Check for token as well, as user might be set from previous session
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, token, navigate]);


  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
          {error && !formError && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
