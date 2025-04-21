import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage, SecureStorageKeys } from './secureStorageService';

// Biometric service for handling biometric authentication
const biometricService = {
  // Check if biometrics is available on the device
  isBiometricsAvailable: async (): Promise<boolean> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      return false;
    }
  },
  
  // Alias for isBiometricsAvailable for backward compatibility
  isBiometricAvailable: async (): Promise<{ available: boolean }> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return { available: compatible && enrolled };
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      return { available: false };
    }
  },
  
  // Check if biometrics is enabled for the app
  isBiometricsEnabled: async (): Promise<boolean> => {
    try {
      const value = await secureStorage.getItem(SecureStorageKeys.BIOMETRICS_ENABLED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking if biometrics is enabled:', error);
      return false;
    }
  },
  
  // Enable biometrics for the app
  enableBiometrics: async (): Promise<boolean> => {
    try {
      const available = await biometricService.isBiometricsAvailable();
      
      if (!available) {
        return false;
      }
      
      await secureStorage.setItem(SecureStorageKeys.BIOMETRICS_ENABLED, 'true');
      return true;
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return false;
    }
  },
  
  // Disable biometrics for the app
  disableBiometrics: async (): Promise<boolean> => {
    try {
      await secureStorage.setItem(SecureStorageKeys.BIOMETRICS_ENABLED, 'false');
      await secureStorage.setItem(SecureStorageKeys.BIOMETRICS_APP_ACCESS, 'false');
      return true;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      return false;
    }
  },
  
  // Check if biometrics is enabled for app access
  isBiometricsForAppAccessEnabled: async (): Promise<boolean> => {
    try {
      const value = await secureStorage.getItem(SecureStorageKeys.BIOMETRICS_APP_ACCESS);
      return value === 'true';
    } catch (error) {
      console.error('Error checking if biometrics for app access is enabled:', error);
      return false;
    }
  },
  
  // Enable biometrics for app access
  enableBiometricsForAppAccess: async (): Promise<boolean> => {
    try {
      const biometricsEnabled = await biometricService.isBiometricsEnabled();
      
      if (!biometricsEnabled) {
        return false;
      }
      
      await secureStorage.setItem(SecureStorageKeys.BIOMETRICS_APP_ACCESS, 'true');
      return true;
    } catch (error) {
      console.error('Error enabling biometrics for app access:', error);
      return false;
    }
  },
  
  // Disable biometrics for app access
  disableBiometricsForAppAccess: async (): Promise<boolean> => {
    try {
      await secureStorage.setItem(SecureStorageKeys.BIOMETRICS_APP_ACCESS, 'false');
      return true;
    } catch (error) {
      console.error('Error disabling biometrics for app access:', error);
      return false;
    }
  },
  
  // Authenticate using biometrics
  authenticate: async (promptMessage: string): Promise<boolean> => {
    try {
      const biometricsEnabled = await biometricService.isBiometricsEnabled();
      
      if (!biometricsEnabled) {
        return false;
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use passcode',
      });
      
      return result.success;
    } catch (error) {
      console.error('Error authenticating with biometrics:', error);
      return false;
    }
  },
  
  // Get available biometric types
  getBiometricTypes: async (): Promise<LocalAuthentication.AuthenticationType[]> => {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  },
};

export default biometricService;