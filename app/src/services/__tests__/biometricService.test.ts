import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import biometricService, { BiometricStorageKeys } from '../biometricService';
import secureStorage from '../secureStorageService';

// Mock ReactNativeBiometrics
jest.mock('react-native-biometrics', () => {
  const BiometryTypes = {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  };

  return {
    BiometryTypes,
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      isSensorAvailable: jest.fn(),
      simplePrompt: jest.fn(),
      createKeys: jest.fn(),
      deleteKeys: jest.fn(),
      biometricKeysExist: jest.fn(),
      createSignature: jest.fn(),
    })),
  };
});

// Mock secureStorage
jest.mock('../secureStorageService', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  SecureStorageKeys: {
    BIOMETRICS_ENABLED: 'biometricsEnabled',
    BIOMETRICS_FOR_APP_ACCESS: 'biometricsForAppAccess',
    BIOMETRICS_FOR_TOTP_ACCESS: 'biometricsForTOTPAccess',
    BIOMETRIC_PUBLIC_KEY: 'biometricPublicKey',
  },
}));

describe('Biometric Service', () => {
  let mockRNBiometrics: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Get the mocked instance
    mockRNBiometrics = (ReactNativeBiometrics as unknown as jest.Mock).mock.results[0].value;
  });

  describe('isBiometricAvailable', () => {
    it('should return available=true when biometrics are available', async () => {
      // Arrange
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });

      // Act
      const result = await biometricService.isBiometricAvailable();

      // Assert
      expect(mockRNBiometrics.isSensorAvailable).toHaveBeenCalled();
      expect(result).toEqual({
        available: true,
        biometryType: BiometryTypes.FaceID,
      });
    });

    it('should return available=false when biometrics are not available', async () => {
      // Arrange
      mockRNBiometrics.isSensorAvailable.mockResolvedValueOnce({
        available: false,
        biometryType: undefined,
      });

      // Act
      const result = await biometricService.isBiometricAvailable();

      // Assert
      expect(mockRNBiometrics.isSensorAvailable).toHaveBeenCalled();
      expect(result).toEqual({
        available: false,
        biometryType: undefined,
      });
    });

    it('should handle errors and return available=false', async () => {
      // Arrange
      mockRNBiometrics.isSensorAvailable.mockRejectedValueOnce(new Error('Biometrics error'));

      // Act
      const result = await biometricService.isBiometricAvailable();

      // Assert
      expect(mockRNBiometrics.isSensorAvailable).toHaveBeenCalled();
      expect(result).toEqual({
        available: false,
        error: 'Error: Biometrics error',
      });
    });
  });

  describe('authenticate', () => {
    it('should call simplePrompt with the correct parameters', async () => {
      // Arrange
      const promptMessage = 'Test authentication';
      mockRNBiometrics.simplePrompt.mockResolvedValueOnce({
        success: true,
      });

      // Act
      const result = await biometricService.authenticate(promptMessage);

      // Assert
      expect(mockRNBiometrics.simplePrompt).toHaveBeenCalledWith({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      expect(result).toEqual({
        success: true,
      });
    });

    it('should use default prompt message when not provided', async () => {
      // Arrange
      mockRNBiometrics.simplePrompt.mockResolvedValueOnce({
        success: true,
      });

      // Act
      const result = await biometricService.authenticate();

      // Assert
      expect(mockRNBiometrics.simplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Verify your identity',
        cancelButtonText: 'Cancel',
      });
      expect(result).toEqual({
        success: true,
      });
    });

    it('should handle authentication failure', async () => {
      // Arrange
      mockRNBiometrics.simplePrompt.mockResolvedValueOnce({
        success: false,
      });

      // Act
      const result = await biometricService.authenticate();

      // Assert
      expect(result).toEqual({
        success: false,
      });
    });

    it('should handle errors during authentication', async () => {
      // Arrange
      mockRNBiometrics.simplePrompt.mockRejectedValueOnce(new Error('Authentication error'));

      // Act
      const result = await biometricService.authenticate();

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Error: Authentication error',
      });
    });
  });

  describe('createKeys', () => {
    it('should create keys and store the public key', async () => {
      // Arrange
      const publicKey = 'test-public-key';
      mockRNBiometrics.createKeys.mockResolvedValueOnce({
        publicKey,
      });
      (secureStorage.setItem as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await biometricService.createKeys();

      // Assert
      expect(mockRNBiometrics.createKeys).toHaveBeenCalled();
      expect(secureStorage.setItem).toHaveBeenCalledWith(BiometricStorageKeys.BIOMETRIC_PUBLIC_KEY, publicKey);
      expect(result).toEqual({
        publicKey,
      });
    });

    it('should handle errors during key creation', async () => {
      // Arrange
      mockRNBiometrics.createKeys.mockRejectedValueOnce(new Error('Key creation error'));

      // Act
      const result = await biometricService.createKeys();

      // Assert
      expect(mockRNBiometrics.createKeys).toHaveBeenCalled();
      expect(secureStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual({
        publicKey: null,
        error: 'Error: Key creation error',
      });
    });
  });

  describe('deleteKeys', () => {
    it('should delete keys and remove the public key from storage', async () => {
      // Arrange
      mockRNBiometrics.deleteKeys.mockResolvedValueOnce({
        keysDeleted: true,
      });
      (secureStorage.removeItem as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await biometricService.deleteKeys();

      // Assert
      expect(mockRNBiometrics.deleteKeys).toHaveBeenCalled();
      expect(secureStorage.removeItem).toHaveBeenCalledWith(BiometricStorageKeys.BIOMETRIC_PUBLIC_KEY);
      expect(result).toBe(true);
    });

    it('should not remove the public key if keys were not deleted', async () => {
      // Arrange
      mockRNBiometrics.deleteKeys.mockResolvedValueOnce({
        keysDeleted: false,
      });

      // Act
      const result = await biometricService.deleteKeys();

      // Assert
      expect(mockRNBiometrics.deleteKeys).toHaveBeenCalled();
      expect(secureStorage.removeItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors during key deletion', async () => {
      // Arrange
      mockRNBiometrics.deleteKeys.mockRejectedValueOnce(new Error('Key deletion error'));

      // Act
      const result = await biometricService.deleteKeys();

      // Assert
      expect(mockRNBiometrics.deleteKeys).toHaveBeenCalled();
      expect(secureStorage.removeItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('biometricKeysExist', () => {
    it('should return true when keys exist', async () => {
      // Arrange
      mockRNBiometrics.biometricKeysExist.mockResolvedValueOnce({
        keysExist: true,
      });

      // Act
      const result = await biometricService.biometricKeysExist();

      // Assert
      expect(mockRNBiometrics.biometricKeysExist).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when keys do not exist', async () => {
      // Arrange
      mockRNBiometrics.biometricKeysExist.mockResolvedValueOnce({
        keysExist: false,
      });

      // Act
      const result = await biometricService.biometricKeysExist();

      // Assert
      expect(mockRNBiometrics.biometricKeysExist).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle errors and return false', async () => {
      // Arrange
      mockRNBiometrics.biometricKeysExist.mockRejectedValueOnce(new Error('Keys check error'));

      // Act
      const result = await biometricService.biometricKeysExist();

      // Assert
      expect(mockRNBiometrics.biometricKeysExist).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('signWithBiometrics', () => {
    it('should sign data with biometrics and return the signature', async () => {
      // Arrange
      const payload = 'test-payload';
      const promptMessage = 'Test signing';
      const signature = 'test-signature';
      mockRNBiometrics.createSignature.mockResolvedValueOnce({
        success: true,
        signature,
      });

      // Act
      const result = await biometricService.signWithBiometrics(payload, promptMessage);

      // Assert
      expect(mockRNBiometrics.createSignature).toHaveBeenCalledWith({
        promptMessage,
        payload,
        cancelButtonText: 'Cancel',
      });
      expect(result).toBe(signature);
    });

    it('should use default prompt message when not provided', async () => {
      // Arrange
      const payload = 'test-payload';
      const signature = 'test-signature';
      mockRNBiometrics.createSignature.mockResolvedValueOnce({
        success: true,
        signature,
      });

      // Act
      const result = await biometricService.signWithBiometrics(payload);

      // Assert
      expect(mockRNBiometrics.createSignature).toHaveBeenCalledWith({
        promptMessage: 'Sign with your biometrics',
        payload,
        cancelButtonText: 'Cancel',
      });
      expect(result).toBe(signature);
    });

    it('should return null when signing fails', async () => {
      // Arrange
      const payload = 'test-payload';
      mockRNBiometrics.createSignature.mockResolvedValueOnce({
        success: false,
        signature: null,
      });

      // Act
      const result = await biometricService.signWithBiometrics(payload);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle errors during signing', async () => {
      // Arrange
      const payload = 'test-payload';
      mockRNBiometrics.createSignature.mockRejectedValueOnce(new Error('Signing error'));

      // Act
      const result = await biometricService.signWithBiometrics(payload);

      // Assert
      expect(result).toBeNull();
    });
  });

  // Additional tests for other biometric service methods can be added here
});