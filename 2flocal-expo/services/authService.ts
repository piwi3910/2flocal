import apiClient, { setAuthToken as setApiAuthToken } from './apiClient';

// Re-export setAuthToken for use in other files
export { setApiAuthToken as setAuthToken };
import { secureStorage, SecureStorageKeys } from './secureStorageService';

// User interface
export interface User {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Login request interface
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response interface
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Register request interface
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Refresh token response interface
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// Auth service for handling authentication
const authService = {
  // Login user
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      
      // Save tokens to secure storage
      if (response.data.accessToken) {
        await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, response.data.accessToken);
      }
      
      if (response.data.refreshToken) {
        await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN, response.data.refreshToken);
      }
      
      // Set auth token for API requests
      setApiAuthToken(response.data.accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register user
  register: async (data: RegisterRequest): Promise<void> => {
    try {
      await apiClient.post('/auth/register', data);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  // Refresh token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    try {
      const refreshToken = await secureStorage.getItem(SecureStorageKeys.REFRESH_TOKEN);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh-token', {
        refreshToken,
      });
      
      // Save new tokens to secure storage
      if (response.data.accessToken) {
        await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, response.data.accessToken);
      }
      
      if (response.data.refreshToken) {
        await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN, response.data.refreshToken);
      }
      
      // Set auth token for API requests
      setApiAuthToken(response.data.accessToken);
      
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async (): Promise<void> => {
    try {
      // Call logout endpoint
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server logout fails
    } finally {
      // Clear tokens from secure storage
      await secureStorage.removeItem(SecureStorageKeys.ACCESS_TOKEN);
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
      
      // Clear auth token for API requests
      setApiAuthToken('');
    }
  },
  
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/request-password-reset', { email });
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  },
  
  // Reset password
  resetPassword: async (data: { token: string, password: string }): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', data);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    try {
      await apiClient.post('/auth/verify-email', { token });
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  },
  
  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
  
  // Resend verification email
  resendVerificationEmail: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/resend-verification-email');
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  },
  
  // Forgot password (alias for requestPasswordReset)
  forgotPassword: async (data: { email: string }): Promise<void> => {
    try {
      await apiClient.post('/auth/request-password-reset', data);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put<User>('/auth/profile', data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};

export default authService;