import axios from 'axios';

// Define the base URL for the API
// When running in iOS simulator, we need to use the machine's IP address instead of localhost
const API_URL = 'http://127.0.0.1:3001/api';

// Create an axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set the auth token for authenticated requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;