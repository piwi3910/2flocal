import axios from 'axios';
import totpService from '../totpService';
import { api } from '../apiClient';

// Mock the API client
jest.mock('../apiClient', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('TOTP Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getSecrets', () => {
    it('should call the API and return TOTP secrets', async () => {
      // Arrange
      const mockSecrets = [
        {
          id: 'totp-1',
          issuer: 'Example Service',
          label: 'user@example.com',
          createdAt: '2025-04-01T12:00:00Z',
          updatedAt: '2025-04-01T12:00:00Z',
        },
        {
          id: 'totp-2',
          issuer: 'Another Service',
          label: 'user@anotherexample.com',
          createdAt: '2025-04-02T12:00:00Z',
          updatedAt: '2025-04-02T12:00:00Z',
        },
      ];
      
      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockSecrets });

      // Act
      const result = await totpService.getSecrets();

      // Assert
      expect(api.get).toHaveBeenCalledWith('/accounts');
      expect(result).toEqual(mockSecrets);
    });

    it('should throw an error when API call fails', async () => {
      // Arrange
      const mockError = {
        response: {
          data: {
            message: 'Failed to get TOTP secrets',
          },
        },
      };
      (api.get as jest.Mock).mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(totpService.getSecrets()).rejects.toThrow('Failed to get TOTP secrets');
    });

    it('should throw a generic error when network error occurs', async () => {
      // Arrange
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      // Act & Assert
      await expect(totpService.getSecrets()).rejects.toThrow('Network error while fetching TOTP secrets');
    });
  });

  describe('getTOTPCode', () => {
    it('should call the API with the correct secret ID and return TOTP code', async () => {
      // Arrange
      const secretId = 'totp-1';
      const mockTOTPCode = {
        code: '123456',
        remainingSeconds: 25,
        period: 30,
        issuer: 'Example Service',
        label: 'user@example.com',
      };
      
      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockTOTPCode });

      // Act
      const result = await totpService.getTOTPCode(secretId);

      // Assert
      expect(api.get).toHaveBeenCalledWith(`/accounts/${secretId}/totp`);
      expect(result).toEqual(mockTOTPCode);
    });
  });

  describe('addSecret', () => {
    it('should call the API with the correct data and return the created secret', async () => {
      // Arrange
      const secretData = {
        issuer: 'New Service',
        label: 'user@newservice.com',
        secret: 'ABCDEFGHIJKLMNOP',
      };
      
      const mockCreatedSecret = {
        id: 'totp-3',
        issuer: 'New Service',
        label: 'user@newservice.com',
        createdAt: '2025-04-19T08:37:00Z',
        updatedAt: '2025-04-19T08:37:00Z',
      };
      
      (api.post as jest.Mock).mockResolvedValueOnce({ data: mockCreatedSecret });

      // Act
      const result = await totpService.addSecret(secretData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/accounts', secretData);
      expect(result).toEqual(mockCreatedSecret);
    });
  });

  describe('deleteSecret', () => {
    it('should call the API with the correct secret ID', async () => {
      // Arrange
      const secretId = 'totp-1';
      (api.delete as jest.Mock).mockResolvedValueOnce({});

      // Act
      await totpService.deleteSecret(secretId);

      // Assert
      expect(api.delete).toHaveBeenCalledWith(`/accounts/${secretId}`);
    });

    it('should throw an error when API call fails', async () => {
      // Arrange
      const secretId = 'totp-1';
      const mockError = {
        response: {
          data: {
            message: 'Secret not found',
          },
        },
      };
      (api.delete as jest.Mock).mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(totpService.deleteSecret(secretId)).rejects.toThrow('Secret not found');
    });
  });

  describe('generateQRCode', () => {
    it('should call the API with the correct secret ID and return QR code data', async () => {
      // Arrange
      const secretId = 'totp-1';
      const mockQRCode = {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        uri: 'otpauth://totp/Example:user@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Example',
      };
      
      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockQRCode });

      // Act
      const result = await totpService.generateQRCode(secretId);

      // Assert
      expect(api.get).toHaveBeenCalledWith(`/accounts/${secretId}/qrcode`);
      expect(result).toEqual(mockQRCode);
    });
  });

  describe('parseQRCode', () => {
    it('should call the API with the correct image data and return parsed URI data', async () => {
      // Arrange
      const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
      const mockParsedData = {
        uri: 'otpauth://totp/Example:user@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Example',
        secret: 'ABCDEFGHIJKLMNOP',
        issuer: 'Example',
        label: 'user@example.com',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      };
      
      (api.post as jest.Mock).mockResolvedValueOnce({ data: mockParsedData });

      // Act
      const result = await totpService.parseQRCode(imageData);

      // Assert
      expect(api.post).toHaveBeenCalledWith('/accounts/parse-qrcode', { image: imageData });
      expect(result).toEqual(mockParsedData);
    });
  });
});