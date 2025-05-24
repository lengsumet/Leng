import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const register = (username, email, password) => {
  return axios.post(`${API_URL}/auth/register`, {
    username,
    email,
    password,
  });
};

const login = (email, password) => {
  return axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
};

const getProfile = (token: string) => {
  return axios.get(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`, // Assuming backend expects Bearer token
    },
  });
};

export default {
  register,
  login,
  getProfile,
};
