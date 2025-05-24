import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Container, Typography, Button, Paper, Box, Grid, CircularProgress, Divider } from '@mui/material';
import CreateUserForm from '../components/admin/CreateUserForm'; // Import the form

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logoutUser, isLoading: authLoading } = useAuthStore(); // Renamed isLoading to authLoading to avoid conflict

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // This loading state is for the auth check from useAuthStore
  if (authLoading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)">
        <CircularProgress />
      </Box>
    );
  }

  // ProtectedRoute should handle unauthenticated users, but this is a safeguard.
  if (!user) {
    navigate('/login');
    return null; 
  }
  
  // ProtectedRoute should also handle role checks, but this is an additional safeguard.
  if (user.role !== 'admin') {
    navigate('/dashboard'); // Or a dedicated "Not Authorized" page
    return null;
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}> {/* Responsive padding */}
        <Grid container spacing={3} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography component="h1" variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="h6">
              Welcome, Administrator {user.username}!
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              disabled={authLoading}
            >
              {authLoading ? <CircularProgress size={24} color="inherit" /> : 'Logout'}
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle1"><strong>Email:</strong> {user.email}</Typography>
          <Typography variant="subtitle1"><strong>Role:</strong> {user.role}</Typography>
          <Typography variant="subtitle1"><strong>Level:</strong> {user.level}</Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* User Creation Form Section */}
        <CreateUserForm />
        
        {/* Placeholder for other admin functionalities */}
        <Typography variant="body1" sx={{ mt: 4, fontStyle: 'italic' }}>
          More admin functionalities (User Management, Reporting, etc.) can be added here.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminDashboardPage;
