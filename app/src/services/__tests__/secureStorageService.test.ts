import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import secureStorage, { SecureStorageKeys, LegacyStorageKeys } from '../secureStorageService';

// Mock Keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

describe('Secure Storage Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('should call Keychain.setGenericPassword with correct parameters', async () => {
      // Arrange
      const key = 'testKey';
      const value = 'testValue';
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await secureStorage.setItem(key, value);

      // Assert
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(key, value, { service: key });
      expect(result).toBe(true);
    });

    it('should return false when Keychain.setGenericPassword fails', async () => {
      // Arrange
      const key = 'testKey';
      const value = 'testValue';
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));

      // Act
      const result = await secureStorage.setItem(key, value);

      // Assert
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(key, value, { service: key });
      expect(result).toBe(false);
    });
  });

  describe('setObject', () => {
    it('should stringify the object and call setItem', async () => {
      // Arrange
      const key = 'testObjectKey';
      const value = { name: 'Test User', email: 'test@example.com' };
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await secureStorage.setObject(key, value);

      // Assert
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        { service: key }
      );
      expect(result).toBe(true);
    });

    it('should return false when setItem fails', async () => {
      // Arrange
      const key = 'testObjectKey';
      const value = { name: 'Test User', email: 'test@example.com' };
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));

      // Act
      const result = await secureStorage.setObject(key, value);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getItem', () => {
    it('should call Keychain.getGenericPassword with correct parameters', async () => {
      // Arrange
      const key = 'testKey';
      const mockCredentials = { username: key, password: 'testValue' };
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(mockCredentials);

      // Act
      const result = await secureStorage.getItem(key);

      // Assert
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: key });
      expect(result).toBe(mockCredentials.password);
    });

    it('should return null when no credentials are found', async () => {
      // Arrange
      const key = 'testKey';
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

      // Act
      const result = await secureStorage.getItem(key);

      // Assert
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: key });
      expect(result).toBeNull();
    });

    it('should return null when Keychain.getGenericPassword fails', async () => {
      // Arrange
      const key = 'testKey';
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));

      // Act
      const result = await secureStorage.getItem(key);

      // Assert
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: key });
      expect(result).toBeNull();
    });
  });

  describe('getObject', () => {
    it('should parse the JSON string returned by getItem', async () => {
      // Arrange
      const key = 'testObjectKey';
      const mockObject = { name: 'Test User', email: 'test@example.com' };
      const mockCredentials = { username: key, password: JSON.stringify(mockObject) };
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(mockCredentials);

      // Act
      const result = await secureStorage.getObject(key);

      // Assert
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({ service: key });
      expect(result).toEqual(mockObject);
    });

    it('should return null when getItem returns null', async () => {
      // Arrange
      const key = 'testObjectKey';
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

      // Act
      const result = await secureStorage.getObject(key);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when JSON parsing fails', async () => {
      // Arrange
      const key = 'testObjectKey';
      const mockCredentials = { username: key, password: 'invalid-json' };
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(mockCredentials);

      // Act
      const result = await secureStorage.getObject(key);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('should call Keychain.resetGenericPassword with correct parameters', async () => {
      // Arrange
      const key = 'testKey';
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await secureStorage.removeItem(key);

      // Assert
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({ service: key });
      expect(result).toBe(true);
    });

    it('should return false when Keychain.resetGenericPassword fails', async () => {
      // Arrange
      const key = 'testKey';
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));

      // Act
      const result = await secureStorage.removeItem(key);

      // Assert
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({ service: key });
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should reset all known keys', async () => {
      // Arrange
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await secureStorage.clear();

      // Assert
      expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(Object.values(SecureStorageKeys).length);
      Object.values(SecureStorageKeys).forEach(key => {
        expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({ service: key });
      });
      expect(result).toBe(true);
    });

    it('should return false when any reset operation fails', async () => {
      // Arrange
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValueOnce(true);
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));

      // Act
      const result = await secureStorage.clear();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('migrateFromAsyncStorage', () => {
    it('should not migrate if already migrated', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

      // Act
      const result = await secureStorage.migrateFromAsyncStorage();

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@2FLocal:secureStorageMigrated');
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should migrate all values from AsyncStorage to secure storage', async () => {
      // Arrange
      const mockToken = 'test-token';
      const mockUser = JSON.stringify({ id: '1', email: 'test@example.com' });
      const mockRefreshToken = 'test-refresh-token';
      const mockRefreshTokenExpiry = '2025-05-19T08:38:00Z';

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // secureStorageMigrated flag
        .mockResolvedValueOnce(mockToken) // ACCESS_TOKEN
        .mockResolvedValueOnce(mockUser) // USER_DATA
        .mockResolvedValueOnce(mockRefreshToken) // REFRESH_TOKEN
        .mockResolvedValueOnce(mockRefreshTokenExpiry); // REFRESH_TOKEN_EXPIRY

      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await secureStorage.migrateFromAsyncStorage();

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@2FLocal:secureStorageMigrated');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(LegacyStorageKeys.ACCESS_TOKEN);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(LegacyStorageKeys.USER_DATA);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(LegacyStorageKeys.REFRESH_TOKEN);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(LegacyStorageKeys.REFRESH_TOKEN_EXPIRY);

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStorageKeys.ACCESS_TOKEN,
        mockToken,
        { service: SecureStorageKeys.ACCESS_TOKEN }
      );
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStorageKeys.USER_DATA,
        mockUser,
        { service: SecureStorageKeys.USER_DATA }
      );
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStorageKeys.REFRESH_TOKEN,
        mockRefreshToken,
        { service: SecureStorageKeys.REFRESH_TOKEN }
      );
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        SecureStorageKeys.REFRESH_TOKEN_EXPIRY,
        mockRefreshTokenExpiry,
        { service: SecureStorageKeys.REFRESH_TOKEN_EXPIRY }
      );

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@2FLocal:secureStorageMigrated', 'true');
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        LegacyStorageKeys.ACCESS_TOKEN,
        LegacyStorageKeys.USER_DATA,
        LegacyStorageKeys.REFRESH_TOKEN,
        LegacyStorageKeys.REFRESH_TOKEN_EXPIRY,
      ]);

      expect(result).toBe(true);
    });

    it('should handle missing values during migration', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // secureStorageMigrated flag
        .mockResolvedValueOnce(null) // ACCESS_TOKEN
        .mockResolvedValueOnce(null) // USER_DATA
        .mockResolvedValueOnce(null) // REFRESH_TOKEN
        .mockResolvedValueOnce(null); // REFRESH_TOKEN_EXPIRY

      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await secureStorage.migrateFromAsyncStorage();

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@2FLocal:secureStorageMigrated', 'true');
      expect(result).toBe(true);
    });

    it('should return false when migration fails', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null) // secureStorageMigrated flag
        .mockRejectedValueOnce(new Error('AsyncStorage error')); // ACCESS_TOKEN

      // Act
      const result = await secureStorage.migrateFromAsyncStorage();

      // Assert
      expect(result).toBe(false);
    });
  });
});