import React, { useState } from 'react';
import adminService from '../../services/adminService';
import useAuthStore from '../../store/authStore';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';

const CreateUserForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuthStore.getState(); // Get token directly for submission

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Basic email format validation (browser usually handles this with type="email")
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Invalid email format.');
        return;
    }
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }


    setIsLoading(true);
    try {
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      const userData = { username, email, password };
      const response = await adminService.createUserByAdmin(userData); // Token is handled by the service
      
      setSuccess(`User "${response.user.username}" created successfully!`);
      // Clear form
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px', maxWidth: '500px' }}>
      <Typography component="h2" variant="h5" gutterBottom>
        Create New User
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="new-username"
          label="Username"
          name="new-username"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="new-email"
          label="Email Address"
          name="new-email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="new-password"
          label="Password"
          type="password"
          id="new-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
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
          disabled={isLoading}
        />
        
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create User'}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateUserForm;
