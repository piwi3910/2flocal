import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import secureStorage, { SecureStorageKeys } from './secureStorageService';

// Create a singleton instance of ReactNativeBiometrics
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true, // Allow fallback to device PIN/pattern/password
});

// Use the keys from SecureStorageKeys for consistency
export const BiometricStorageKeys = {
  BIOMETRICS_ENABLED: SecureStorageKeys.BIOMETRICS_ENABLED,
  BIOMETRICS_FOR_APP_ACCESS: SecureStorageKeys.BIOMETRICS_FOR_APP_ACCESS,
  BIOMETRICS_FOR_TOTP_ACCESS: SecureStorageKeys.BIOMETRICS_FOR_TOTP_ACCESS,
  BIOMETRIC_PUBLIC_KEY: SecureStorageKeys.BIOMETRIC_PUBLIC_KEY,
};

export interface BiometricAvailability {
  available: boolean;
  biometryType?: string;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export interface BiometricKeyResult {
  publicKey: string | null;
  error?: string;
}

export const biometricService = {
  /**
   * Check if biometric authentication is available on the device
   * @returns Promise with availability status and biometry type
   */
  async isBiometricAvailable(): Promise<BiometricAvailability> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return { available, biometryType };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false, error: String(error) };
    }
  },

  /**
   * Prompt user for biometric authentication
   * @param promptMessage Message to display to the user
   * @returns Promise with authentication result
   */
  async authenticate(
    promptMessage: string = 'Verify your identity'
  ): Promise<BiometricAuthResult> {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return { success };
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return { success: false, error: String(error) };
    }
  },

  /**
   * Create and store biometric keys
   * @returns Promise with the public key
   */
  async createKeys(): Promise<BiometricKeyResult> {
    try {
      const { publicKey } = await rnBiometrics.createKeys();
      
      // Store the public key in secure storage
      if (publicKey) {
        await secureStorage.setItem(BiometricStorageKeys.BIOMETRIC_PUBLIC_KEY, publicKey);
      }
      
      return { publicKey };
    } catch (error) {
      console.error('Error creating biometric keys:', error);
      return { publicKey: null, error: String(error) };
    }
  },

  /**
   * Delete existing biometric keys
   * @returns Promise with deletion result
   */
  async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await rnBiometrics.deleteKeys();
      
      // Remove the public key from secure storage
      if (keysDeleted) {
        await secureStorage.removeItem(BiometricStorageKeys.BIOMETRIC_PUBLIC_KEY);
      }
      
      return keysDeleted;
    } catch (error) {
      console.error('Error deleting biometric keys:', error);
      return false;
    }
  },

  /**
   * Check if biometric keys exist
   * @returns Promise with key existence status
   */
  async biometricKeysExist(): Promise<boolean> {
    try {
      const { keysExist } = await rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Error checking biometric keys:', error);
      return false;
    }
  },

  /**
   * Sign data with biometric authentication
   * @param payload Data to sign
   * @param promptMessage Message to display to the user
   * @returns Promise with signature or null if failed
   */
  async signWithBiometrics(
    payload: string,
    promptMessage: string = 'Sign with your biometrics'
  ): Promise<string | null> {
    try {
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: 'Cancel',
      });
      
      return success && signature ? signature : null;
    } catch (error) {
      console.error('Error signing with biometrics:', error);
      return null;
    }
  },

  /**
   * Get a user-friendly display name for the biometry type
   * @param biometryType The biometry type from isSensorAvailable
   * @returns User-friendly name for the biometry type
   */
  getBiometryTypeDisplay(biometryType?: string): string {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return 'Fingerprint';
      default:
        return 'Biometric Authentication';
    }
  },

  /**
   * Enable biometric authentication
   * @returns Promise with success status
   */
  async enableBiometrics(): Promise<boolean> {
    try {
      // Check if biometrics are available
      const { available } = await this.isBiometricAvailable();
      if (!available) {
        return false;
      }
      
      // Create biometric keys if they don't exist
      const keysExist = await this.biometricKeysExist();
      if (!keysExist) {
        const { publicKey } = await this.createKeys();
        if (!publicKey) {
          return false;
        }
      }
      
      // Set biometrics as enabled in secure storage
      await secureStorage.setItem(BiometricStorageKeys.BIOMETRICS_ENABLED, 'true');
      return true;
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return false;
    }
  },

  /**
   * Disable biometric authentication
   * @returns Promise with success status
   */
  async disableBiometrics(): Promise<boolean> {
    try {
      // Delete biometric keys
      await this.deleteKeys();
      
      // Set biometrics as disabled in secure storage
      await secureStorage.setItem(BiometricStorageKeys.BIOMETRICS_ENABLED, 'false');
      await secureStorage.removeItem(BiometricStorageKeys.BIOMETRICS_FOR_APP_ACCESS);
      await secureStorage.removeItem(BiometricStorageKeys.BIOMETRICS_FOR_TOTP_ACCESS);
      
      return true;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      return false;
    }
  },

  /**
   * Check if biometric authentication is enabled
   * @returns Promise with enabled status
   */
  async isBiometricsEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem(BiometricStorageKeys.BIOMETRICS_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking if biometrics are enabled:', error);
      return false;
    }
  },

  /**
   * Set whether biometrics should be used for app access
   * @param enabled Whether to enable biometrics for app access
   * @returns Promise with success status
   */
  async setBiometricsForAppAccess(enabled: boolean): Promise<boolean> {
    try {
      await secureStorage.setItem(
        BiometricStorageKeys.BIOMETRICS_FOR_APP_ACCESS,
        enabled ? 'true' : 'false'
      );
      return true;
    } catch (error) {
      console.error('Error setting biometrics for app access:', error);
      return false;
    }
  },

  /**
   * Check if biometrics are enabled for app access
   * @returns Promise with enabled status
   */
  async isBiometricsForAppAccessEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem(BiometricStorageKeys.BIOMETRICS_FOR_APP_ACCESS);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking if biometrics are enabled for app access:', error);
      return false;
    }
  },

  /**
   * Set whether biometrics should be used for TOTP access
   * @param enabled Whether to enable biometrics for TOTP access
   * @returns Promise with success status
   */
  async setBiometricsForTOTPAccess(enabled: boolean): Promise<boolean> {
    try {
      await secureStorage.setItem(
        BiometricStorageKeys.BIOMETRICS_FOR_TOTP_ACCESS,
        enabled ? 'true' : 'false'
      );
      return true;
    } catch (error) {
      console.error('Error setting biometrics for TOTP access:', error);
      return false;
    }
  },

  /**
   * Check if biometrics are enabled for TOTP access
   * @returns Promise with enabled status
   */
  async isBiometricsForTOTPAccessEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem(BiometricStorageKeys.BIOMETRICS_FOR_TOTP_ACCESS);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking if biometrics are enabled for TOTP access:', error);
      return false;
    }
  },
};

export default biometricService;