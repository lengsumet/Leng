import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logoutUser } = useAuthStore();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Store App
        </Typography>
        
        {token && user ? (
          // Authenticated user
          <Box>
            {user.role === 'admin' && (
              <Button color="inherit" component={RouterLink} to="/admin/dashboard">
                Admin Dashboard
              </Button>
            )}
            {/* Show regular dashboard link for both admin and user, or just user */}
            {(user.role === 'user' || user.role === 'admin') && ( 
              <Button color="inherit" component={RouterLink} to="/dashboard">
                Dashboard
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Logout ({user.username})
            </Button>
          </Box>
        ) : (
          // Not authenticated
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
