import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Container, Typography, Button, Paper, Box, Grid, CircularProgress } from '@mui/material';

const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logoutUser, isLoading } = useAuthStore();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (isLoading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)"> {/* Assuming Navbar height is 64px */}
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // This should ideally be handled by ProtectedRoute, but as a fallback:
    navigate('/login');
    return null; 
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          User Dashboard
        </Typography>
        <Typography variant="h6" gutterBottom>
          Welcome, {user.username}!
        </Typography>
        <Box sx={{ mt: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Role:</strong> {user.role}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Level:</strong> {user.level}</Typography>
            </Grid>
          </Grid>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Logout'}
        </Button>
      </Paper>
    </Container>
  );
};

export default UserDashboardPage;
