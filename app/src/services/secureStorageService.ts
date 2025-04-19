import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Keys for secure storage items
 * These keys are used to identify items in the secure storage
 */
export const SecureStorageKeys = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  REFRESH_TOKEN_EXPIRY: 'refreshTokenExpiry',
  // Biometric authentication keys
  BIOMETRICS_ENABLED: 'biometricsEnabled',
  BIOMETRICS_FOR_APP_ACCESS: 'biometricsForAppAccess',
  BIOMETRICS_FOR_TOTP_ACCESS: 'biometricsForTOTPAccess',
  BIOMETRIC_PUBLIC_KEY: 'biometricPublicKey',
};

/**
 * Legacy AsyncStorage keys
 * Used for migration from AsyncStorage to secure storage
 */
export const LegacyStorageKeys = {
  ACCESS_TOKEN: '@2FLocal:token',
  USER_DATA: '@2FLocal:user',
  REFRESH_TOKEN: '@2FLocal:refreshToken',
  REFRESH_TOKEN_EXPIRY: '@2FLocal:refreshTokenExpiry',
};

/**
 * Secure Storage Service
 * Provides methods for securely storing and retrieving sensitive data
 * using the device's secure storage mechanisms (Keychain on iOS, Keystore on Android)
 */
export const secureStorage = {
  /**
   * Store a string value securely
   * @param key - The key to store the value under
   * @param value - The string value to store
   * @returns Promise<boolean> - True if successful, false otherwise
   */
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: key,
      });
      return true;
    } catch (error) {
      console.error(`Error storing ${key} in secure storage:`, error);
      return false;
    }
  },

  /**
   * Store an object value securely by stringifying it
   * @param key - The key to store the value under
   * @param value - The object to store
   * @returns Promise<boolean> - True if successful, false otherwise
   */
  async setObject<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing object ${key} in secure storage:`, error);
      return false;
    }
  },

  /**
   * Retrieve a string value
   * @param key - The key of the value to retrieve
   * @returns Promise<string | null> - The stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: key,
      });
      return credentials ? credentials.password : null;
    } catch (error) {
      console.error(`Error retrieving ${key} from secure storage:`, error);
      return null;
    }
  },

  /**
   * Retrieve an object value
   * @param key - The key of the value to retrieve
   * @returns Promise<T | null> - The stored object or null if not found
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) as T : null;
    } catch (error) {
      console.error(`Error retrieving object ${key} from secure storage:`, error);
      return null;
    }
  },

  /**
   * Delete a stored value
   * @param key - The key of the value to delete
   * @returns Promise<boolean> - True if successful, false otherwise
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: key,
      });
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from secure storage:`, error);
      return false;
    }
  },

  /**
   * Clear all stored values
   * @returns Promise<boolean> - True if successful, false otherwise
   */
  async clear(): Promise<boolean> {
    try {
      // Reset all known keys
      const keys = Object.values(SecureStorageKeys);
      for (const key of keys) {
        await Keychain.resetGenericPassword({
          service: key,
        });
      }
      return true;
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      return false;
    }
  },

  /**
   * Migrate data from AsyncStorage to secure storage
   * This is used to ensure backward compatibility for existing users
   * @returns Promise<boolean> - True if migration was successful or not needed, false otherwise
   */
  async migrateFromAsyncStorage(): Promise<boolean> {
    try {
      // Check if we've already migrated
      const migrationFlag = await AsyncStorage.getItem('@2FLocal:secureStorageMigrated');
      if (migrationFlag === 'true') {
        return true; // Already migrated
      }

      // Migrate access token
      const accessToken = await AsyncStorage.getItem(LegacyStorageKeys.ACCESS_TOKEN);
      if (accessToken) {
        await this.setItem(SecureStorageKeys.ACCESS_TOKEN, accessToken);
      }

      // Migrate user data
      const userData = await AsyncStorage.getItem(LegacyStorageKeys.USER_DATA);
      if (userData) {
        await this.setItem(SecureStorageKeys.USER_DATA, userData);
      }

      // Migrate refresh token
      const refreshToken = await AsyncStorage.getItem(LegacyStorageKeys.REFRESH_TOKEN);
      if (refreshToken) {
        await this.setItem(SecureStorageKeys.REFRESH_TOKEN, refreshToken);
      }

      // Migrate refresh token expiry
      const refreshTokenExpiry = await AsyncStorage.getItem(LegacyStorageKeys.REFRESH_TOKEN_EXPIRY);
      if (refreshTokenExpiry) {
        await this.setItem(SecureStorageKeys.REFRESH_TOKEN_EXPIRY, refreshTokenExpiry);
      }

      // Set migration flag
      await AsyncStorage.setItem('@2FLocal:secureStorageMigrated', 'true');

      // Clear old data from AsyncStorage (optional, can be kept for extra safety)
      await AsyncStorage.multiRemove([
        LegacyStorageKeys.ACCESS_TOKEN,
        LegacyStorageKeys.USER_DATA,
        LegacyStorageKeys.REFRESH_TOKEN,
        LegacyStorageKeys.REFRESH_TOKEN_EXPIRY,
      ]);

      return true;
    } catch (error) {
      console.error('Error migrating from AsyncStorage:', error);
      return false;
    }
  },
};

export default secureStorage;