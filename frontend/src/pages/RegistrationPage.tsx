import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { TextField, Button, Container, Typography, Box, CircularProgress, Alert } from '@mui/material';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!username || !email || !password || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      await registerUser(username, email, password);
      // On successful registration, Zustand store might not immediately reflect the change
      // for redirection, so we directly navigate.
      // Or, you could set a specific state in the store to indicate successful registration.
      navigate('/login'); // Redirect to login after successful registration
    } catch (err: any) {
      // Error is already set in the store, but we can also set formError if needed
      // For this example, the store's error will be displayed by the Alert component.
      // If the error from the store isn't specific enough for the form, use setFormError.
      setFormError(err.message || 'Registration failed. Please try again.');
    }
  };

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
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
          {error && !formError && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>} {/* Display store error if no specific form error */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegistrationPage;
