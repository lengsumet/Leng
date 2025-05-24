import axios from 'axios';
import useAuthStore from '../store/authStore'; // To get the base API URL if not directly imported

// Determine API URL
// Option 1: If your authService or another central place exports API_URL
// import { API_URL } from './authService'; // Assuming authService exports it

// Option 2: Directly use import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

const createUserByAdmin = async (userData: CreateUserData) => {
  // Get token from the auth store
  const token = useAuthStore.getState().token;

  if (!token) {
    // This should ideally not happen if the admin pages are protected
    throw new Error('Admin token not found. Please re-login.');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/admin/users`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Contains { user: { ... } } on success
  } catch (error: any) {
    // Axios wraps the error response in error.response
    if (error.response && error.response.data) {
      // If the server sends a structured error message, re-throw it
      throw new Error(error.response.data.message || 'Failed to create user.');
    }
    // Otherwise, re-throw a generic error
    throw new Error(error.message || 'An unexpected error occurred while creating the user.');
  }
};

export default {
  createUserByAdmin,
};
