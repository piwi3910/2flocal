import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { secureStorage, SecureStorageKeys } from './secureStorageService';
import NetInfo from '@react-native-community/netinfo';

// Base URL for API requests
const API_BASE_URL = 'https://api.2flocal.com';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection');
    }
    
    // Add authorization header if token exists
    const token = await secureStorage.getItem(SecureStorageKeys.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await secureStorage.getItem(SecureStorageKeys.REFRESH_TOKEN);
        
        if (!refreshToken) {
          // No refresh token, reject the request
          return Promise.reject(error);
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        if (response.data.accessToken) {
          // Save the new tokens
          await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, response.data.accessToken);
          
          if (response.data.refreshToken) {
            await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN, response.data.refreshToken);
          }
          
          // Update the authorization header
          apiClient.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        
        // Clear tokens on refresh error
        await secureStorage.removeItem(SecureStorageKeys.ACCESS_TOKEN);
        await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
      }
    }
    
    return Promise.reject(error);
  }
);

// Set auth token for API requests
export const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

// Clear auth token
export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common.Authorization;
};

export default apiClient;