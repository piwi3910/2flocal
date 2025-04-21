import axios from 'axios';
import { api, setAuthToken as setApiAuthToken } from './apiClient';
import { secureStorage, SecureStorageKeys } from '../services/secureStorageService';

// Types for authentication
export interface RegisterData {
  name?: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  refreshTokenExpiry?: string;
  token?: string; // For backward compatibility
  user?: User;
}

// Set the auth token for authenticated requests
export const setAuthToken = (token: string | null) => {
  setApiAuthToken(token);
};

// Authentication service functions
const authService = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Network error during registration');
    }
  },

  // Login a user
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', data);
      
      // Handle both old and new token formats
      if (response.data.accessToken) {
        setAuthToken(response.data.accessToken);
        
        // Store refresh token in secure storage
        if (response.data.refreshToken) {
          await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN, response.data.refreshToken);
          
          if (response.data.refreshTokenExpiry) {
            await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN_EXPIRY, response.data.refreshTokenExpiry);
          }
        }
        
        // For backward compatibility
        response.data.token = response.data.accessToken;
      } else if (response.data.token) {
        setAuthToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error during login');
    }
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get user info');
      }
      throw new Error('Network error while fetching user info');
    }
  },

  // Verify email
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Email verification failed');
      }
      throw new Error('Network error during email verification');
    }
  },

  // Request password reset
  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Password reset request failed');
      }
      throw new Error('Network error during password reset request');
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Password reset failed');
      }
      throw new Error('Network error during password reset');
    }
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<AuthResponse> => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Profile update failed');
      }
      throw new Error('Network error during profile update');
    }
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to resend verification email');
      }
      throw new Error('Network error while resending verification email');
    }
  },

  // Refresh access token
  refreshToken: async (): Promise<AuthResponse> => {
    try {
      // Get stored refresh token
      const refreshToken = await secureStorage.getItem(SecureStorageKeys.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (response.data.accessToken) {
        setAuthToken(response.data.accessToken);
        
        // Update stored refresh token if a new one is provided (token rotation)
        if (response.data.refreshToken) {
          await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN, response.data.refreshToken);
          
          if (response.data.refreshTokenExpiry) {
            await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN_EXPIRY, response.data.refreshTokenExpiry);
          }
        }
        
        // For backward compatibility
        response.data.token = response.data.accessToken;
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Token refresh failed');
      }
      throw new Error('Network error during token refresh');
    }
  },
  
  // Revoke refresh token
  revokeToken: async (): Promise<AuthResponse> => {
    try {
      // Get stored refresh token
      const refreshToken = await secureStorage.getItem(SecureStorageKeys.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/revoke-token', { refreshToken });
      
      // Clear stored refresh token
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN_EXPIRY);
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Token revocation failed');
      }
      throw new Error('Network error during token revocation');
    }
  },
  
  // Logout (client-side only)
  logout: async (): Promise<void> => {
    try {
      // Try to revoke the refresh token on logout
      const refreshToken = await secureStorage.getItem(SecureStorageKeys.REFRESH_TOKEN);
      
      if (refreshToken) {
        try {
          await api.post('/auth/revoke-token', { refreshToken });
        } catch (error) {
          console.error('Error revoking token during logout:', error);
        }
      }
      
      // Clear all auth-related storage
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN_EXPIRY);
      
      setAuthToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear tokens even if there was an error
      setAuthToken(null);
    }
  },
};

export default authService;

