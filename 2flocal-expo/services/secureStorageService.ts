import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
export enum SecureStorageKeys {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
  REFRESH_TOKEN_EXPIRY = 'refresh_token_expiry',
  USER_DATA = 'user_data',
  BIOMETRICS_ENABLED = 'biometrics_enabled',
  BIOMETRICS_APP_ACCESS = 'biometrics_app_access',
}

// Secure storage service
export const secureStorage = {
  // Set an item in secure storage
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting secure storage item ${key}:`, error);
      throw error;
    }
  },
  
  // Get an item from secure storage
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting secure storage item ${key}:`, error);
      throw error;
    }
  },
  
  // Remove an item from secure storage
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing secure storage item ${key}:`, error);
      throw error;
    }
  },
  
  // Check if an item exists in secure storage
  hasItem: async (key: string): Promise<boolean> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking secure storage item ${key}:`, error);
      throw error;
    }
  },
};