import axios from 'axios';
import { api, setAuthToken } from '../apiClient';

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    defaults: {
      headers: {
        common: {},
      },
    },
  })),
}));

describe('API Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('api instance', () => {
    it('should create an axios instance with the correct config', () => {
      // Assert
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3000/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('setAuthToken', () => {
    it('should set the Authorization header when token is provided', () => {
      // Arrange
      const token = 'test-token';

      // Act
      setAuthToken(token);

      // Assert
      expect(api.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should remove the Authorization header when token is null', () => {
      // Arrange
      api.defaults.headers.common['Authorization'] = 'Bearer test-token';

      // Act
      setAuthToken(null);

      // Assert
      expect(api.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});