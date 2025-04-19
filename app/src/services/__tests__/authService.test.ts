import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { setAuthToken } from '../authService';
import { api } from '../apiClient';

// Mock the API client
jest.mock('../apiClient', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
  setAuthToken: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('setAuthToken', () => {
    it('should call the apiClient setAuthToken function', () => {
      // Arrange
      const token = 'test-token';

      // Act
      setAuthToken(token);

      // Assert
      expect(require('../apiClient').setAuthToken).toHaveBeenCalledWith(token);
    });
  });

  describe('register', () => {
    it('should call the API with correct data and return the response', async () => {
      // Arrange
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockResponse = {
        data: {
          message: 'Registration successful',
        },
      };
      api.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when API call fails', async () => {
      // Arrange
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockError = {
        response: {
          data: {
            message: 'Email already exists',
          },
        },
      };
      api.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow('Email already exists');
    });

    it('should throw a generic error when network error occurs', async () => {
      // Arrange
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };
      api.post.mockRejectedValueOnce(new Error('Network Error'));

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow('Network error during registration');
    });
  });

  describe('login', () => {
    it('should call the API with correct data and set auth token', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockResponse = {
        data: {
          message: 'Login successful',
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          refreshTokenExpiry: '2025-05-19T08:37:00Z',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            isEmailVerified: true,
          },
        },
      };
      api.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(setAuthToken).toHaveBeenCalledWith(mockResponse.data.accessToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@2FLocal:refreshToken', mockResponse.data.refreshToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@2FLocal:refreshTokenExpiry', mockResponse.data.refreshTokenExpiry);
      expect(result).toEqual({
        ...mockResponse.data,
        token: mockResponse.data.accessToken, // For backward compatibility
      });
    });

    it('should handle legacy token format', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const mockResponse = {
        data: {
          message: 'Login successful',
          token: 'test-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            isEmailVerified: true,
          },
        },
      };
      api.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(setAuthToken).toHaveBeenCalledWith(mockResponse.data.token);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when API call fails', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };
      api.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should call the API and return user data', async () => {
      // Arrange
      const mockResponse = {
        data: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          isEmailVerified: true,
        },
      };
      api.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logout', () => {
    it('should revoke token and clear storage', async () => {
      // Arrange
      const mockRefreshToken = 'test-refresh-token';
      AsyncStorage.getItem.mockResolvedValueOnce(mockRefreshToken);
      api.post.mockResolvedValueOnce({ data: { message: 'Token revoked' } });

      // Act
      await authService.logout();

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@2FLocal:refreshToken');
      expect(api.post).toHaveBeenCalledWith('/auth/revoke-token', { refreshToken: mockRefreshToken });
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@2FLocal:refreshToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@2FLocal:refreshTokenExpiry');
      expect(setAuthToken).toHaveBeenCalledWith(null);
    });

    it('should handle logout when no refresh token exists', async () => {
      // Arrange
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      // Act
      await authService.logout();

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@2FLocal:refreshToken');
      expect(api.post).not.toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@2FLocal:refreshToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@2FLocal:refreshTokenExpiry');
      expect(setAuthToken).toHaveBeenCalledWith(null);
    });

    it('should handle errors during token revocation', async () => {
      // Arrange
      const mockRefreshToken = 'test-refresh-token';
      AsyncStorage.getItem.mockResolvedValueOnce(mockRefreshToken);
      api.post.mockRejectedValueOnce(new Error('Network Error'));

      // Act
      await authService.logout();

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@2FLocal:refreshToken');
      expect(api.post).toHaveBeenCalledWith('/auth/revoke-token', { refreshToken: mockRefreshToken });
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@2FLocal:refreshToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@2FLocal:refreshTokenExpiry');
      expect(setAuthToken).toHaveBeenCalledWith(null);
    });
  });

  // Additional tests for other auth service methods can be added here
});