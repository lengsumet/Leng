import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
  const { token, user, isLoading, isInitialized } = useAuthStore.getState(); // Get current state

  // isInitialized can be a new state in your store to track if loadUserFromToken has completed
  // For now, we'll rely on isLoading and the presence of token/user after initial load attempt.
  // The initial loadUserFromToken is called in App.tsx

  if (isLoading) { // Show loading indicator if auth state is being determined
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!token || !user) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Authenticated but role not allowed
    // Redirect to a general page or a "Not Authorized" page
    // For now, redirecting to the user's default dashboard or home
    // Consider creating a dedicated "NotAuthorizedPage"
    return <Navigate to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return element; // Authenticated and authorized
};

export default ProtectedRoute;
