import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import useAuthStore from './store/authStore';
import './App.css';
// Removed CircularProgress and Box, as they are now in ProtectedRoute.tsx
// Removed the inline ProtectedRoute component definition.
import ProtectedRoute from './components/ProtectedRoute'; // Import the moved component

const App: React.FC = () => {
  const { loadUserFromToken, user, token, isLoading } = useAuthStore(); // Added isLoading

  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
        loadUserFromToken();
    }
  }, [loadUserFromToken, user]);

  // Display a global loading spinner while the initial token/user check is in progress
  // This prevents rendering routes before auth state is known, avoiding flashes of login page
  if (isLoading && !user && localStorage.getItem('token')) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<UserDashboardPage />} allowedRoles={['user', 'admin']} />} />
        <Route 
          path="/admin/dashboard" 
          element={<ProtectedRoute element={<AdminDashboardPage />} allowedRoles={['admin']} />} 
        />
        
        {/* Fallback route */}
        {/* If token exists but user is not yet loaded (isLoading), ProtectedRoute will handle loading screen */}
        {/* If no token, redirect to login. If token and user, redirect to user's dashboard. */}
        <Route 
          path="*" 
          element={
            token ? (user ? <Navigate to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} /> : <ProtectedRoute element={<HomePage />} />) : <Navigate to="/login" />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
