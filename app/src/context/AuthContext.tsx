import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authService, { User, AuthResponse, setAuthToken } from '../services/authService';
import { api } from '../services/apiClient';
import axios, { AxiosError } from 'axios';
import secureStorage, { SecureStorageKeys } from '../services/secureStorageService';
import biometricService from '../services/biometricService';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Biometric authentication state
  isBiometricsAvailable: boolean;
  isBiometricsEnabled: boolean;
  biometryType: string | undefined;
  // Authentication methods
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, password: string) => Promise<AuthResponse>;
  verifyEmail: (token: string) => Promise<AuthResponse>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<AuthResponse>;
  resendVerificationEmail: () => Promise<AuthResponse>;
  refreshAccessToken: () => Promise<AuthResponse | null>;
  revokeToken: () => Promise<AuthResponse | null>;
  // Biometric authentication methods
  authenticateWithBiometrics: (promptMessage?: string) => Promise<boolean>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<boolean>;
  setBiometricsForAppAccess: (enabled: boolean) => Promise<boolean>;
  isBiometricsForAppAccessEnabled: () => Promise<boolean>;
  setBiometricsForTOTPAccess: (enabled: boolean) => Promise<boolean>;
  isBiometricsForTOTPAccessEnabled: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
  // Biometric authentication state
  isBiometricsAvailable: false,
  isBiometricsEnabled: false,
  biometryType: undefined,
  // Authentication methods
  login: async () => ({ message: '' }),
  register: async () => ({ message: '' }),
  logout: async () => {},
  forgotPassword: async () => ({ message: '' }),
  resetPassword: async () => ({ message: '' }),
  verifyEmail: async () => ({ message: '' }),
  updateProfile: async () => ({ message: '' }),
  resendVerificationEmail: async () => ({ message: '' }),
  refreshAccessToken: async () => null,
  revokeToken: async () => null,
  // Biometric authentication methods
  authenticateWithBiometrics: async () => false,
  enableBiometrics: async () => false,
  disableBiometrics: async () => false,
  setBiometricsForAppAccess: async () => false,
  isBiometricsForAppAccessEnabled: async () => false,
  setBiometricsForTOTPAccess: async () => false,
  isBiometricsForTOTPAccessEnabled: async () => false,
});

// Storage keys are now defined in secureStorageService.ts

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshAttemptRef = useRef<boolean>(false);
  
  // Biometric authentication state
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState<boolean>(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(false);
  const [biometryType, setBiometryType] = useState<string | undefined>(undefined);

  // Logout function - defined early to avoid reference issues
  const logout = useCallback(async (): Promise<void> => {
    try {
      if (refreshToken) {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Error during logout:', error);
        }
      }
    } finally {
      // Clear secure storage
      await secureStorage.clear();
      
      // Update state
      setAuthToken(null);
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, [refreshToken]);

  // Load stored authentication state on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Migrate data from AsyncStorage to secure storage if needed
        await secureStorage.migrateFromAsyncStorage();
        
        // Load data from secure storage
        const storedToken = await secureStorage.getItem(SecureStorageKeys.ACCESS_TOKEN);
        const storedUser = await secureStorage.getObject<User>(SecureStorageKeys.USER_DATA);
        const storedRefreshToken = await secureStorage.getItem(SecureStorageKeys.REFRESH_TOKEN);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setAuthToken(storedToken);
        }
        
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
        }
      } catch (error) {
        console.error('Error loading auth from secure storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);
  
  // Check biometric availability and load biometric settings on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        // Check if biometrics are available on the device
        const { available, biometryType } = await biometricService.isBiometricAvailable();
        setIsBiometricsAvailable(available);
        setBiometryType(biometryType);
        
        // Load biometric settings from secure storage
        const enabled = await biometricService.isBiometricsEnabled();
        setIsBiometricsEnabled(enabled);
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      }
    };
    
    checkBiometrics();
  }, []);

  // Store authentication state when it changes
  useEffect(() => {
    const storeAuthState = async () => {
      try {
        if (token && user) {
          await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, token);
          await secureStorage.setObject(SecureStorageKeys.USER_DATA, user);
        } else {
          // If token or user is null, clear secure storage
          await secureStorage.clear();
        }
      } catch (error) {
        console.error('Error storing auth state in secure storage:', error);
      }
    };

    storeAuthState();
  }, [token, user]);
  
  // Setup axios interceptor for token refresh
  useEffect(() => {
    // Remove any existing interceptors
    const existingInterceptorId = api.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
    api.interceptors.response.eject(existingInterceptorId);
    
    // Add a response interceptor
    const interceptorId = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // If error is 401 (Unauthorized) and we have a refresh token and haven't tried refreshing yet
        if (
          error.response?.status === 401 &&
          refreshToken &&
          originalRequest &&
          !refreshAttemptRef.current
        ) {
          refreshAttemptRef.current = true;
          
          try {
            // Try to refresh the token
            const refreshResult = await authService.refreshToken();
            
            if (refreshResult.accessToken) {
              // Update the token in state and storage
              setToken(refreshResult.accessToken);
              setAuthToken(refreshResult.accessToken);
              
              // Update refresh token if provided
              if (refreshResult.refreshToken) {
                setRefreshToken(refreshResult.refreshToken);
              }
              
              // Retry the original request with the new token
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${refreshResult.accessToken}`;
              }
              
              refreshAttemptRef.current = false;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            
            // If refresh fails, log the user out
            await logout();
          }
          
          refreshAttemptRef.current = false;
        }
        
        return Promise.reject(error);
      }
    );
    
    // Cleanup function
    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, [refreshToken, logout]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authService.login({ email, password });
      
      // Handle both old and new token formats
      if (response.accessToken && response.user) {
        setToken(response.accessToken);
        setUser(response.user);
        setAuthToken(response.accessToken);
        
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
          await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN, response.refreshToken);
        }
      } else if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred during login');
    }
  }, []);

  // Register function
  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authService.register({ name, email, password });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred during registration');
    }
  }, []);
  
  // Refresh token function
  const refreshAccessToken = useCallback(async (): Promise<AuthResponse | null> => {
    try {
      const response = await authService.refreshToken();
      
      if (response.accessToken) {
        setToken(response.accessToken);
        setAuthToken(response.accessToken);
        
        if (response.refreshToken) {
          setRefreshToken(response.refreshToken);
          await secureStorage.setItem(SecureStorageKeys.REFRESH_TOKEN, response.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, []);
  
  // Revoke token function
  const revokeToken = useCallback(async (): Promise<AuthResponse | null> => {
    try {
      const response = await authService.revokeToken();
      setRefreshToken(null);
      await secureStorage.removeItem(SecureStorageKeys.REFRESH_TOKEN);
      return response;
    } catch (error) {
      console.error('Error revoking token:', error);
      return null;
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email: string): Promise<AuthResponse> => {
    try {
      const response = await authService.forgotPassword({ email });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred during password reset request');
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authService.resetPassword({ token, password });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred during password reset');
    }
  }, []);
  
  // Authenticate with biometrics
  const authenticateWithBiometrics = useCallback(
    async (promptMessage: string = 'Verify your identity'): Promise<boolean> => {
      try {
        // Check if biometrics are enabled and available
        if (!isBiometricsEnabled || !isBiometricsAvailable) {
          return false;
        }
        
        // Prompt for biometric authentication
        const { success } = await biometricService.authenticate(promptMessage);
        return success;
      } catch (error) {
        console.error('Error authenticating with biometrics:', error);
        return false;
      }
    },
    [isBiometricsEnabled, isBiometricsAvailable]
  );
  
  // Enable biometrics
  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const success = await biometricService.enableBiometrics();
      if (success) {
        setIsBiometricsEnabled(true);
      }
      return success;
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      return false;
    }
  }, []);
  
  // Disable biometrics
  const disableBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const success = await biometricService.disableBiometrics();
      if (success) {
        setIsBiometricsEnabled(false);
      }
      return success;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      return false;
    }
  }, []);
  
  // Set biometrics for app access
  const setBiometricsForAppAccess = useCallback(async (enabled: boolean): Promise<boolean> => {
    try {
      return await biometricService.setBiometricsForAppAccess(enabled);
    } catch (error) {
      console.error('Error setting biometrics for app access:', error);
      return false;
    }
  }, []);
  
  // Check if biometrics are enabled for app access
  const isBiometricsForAppAccessEnabled = useCallback(async (): Promise<boolean> => {
    try {
      return await biometricService.isBiometricsForAppAccessEnabled();
    } catch (error) {
      console.error('Error checking if biometrics are enabled for app access:', error);
      return false;
    }
  }, []);
  
  // Set biometrics for TOTP access
  const setBiometricsForTOTPAccess = useCallback(async (enabled: boolean): Promise<boolean> => {
    try {
      return await biometricService.setBiometricsForTOTPAccess(enabled);
    } catch (error) {
      console.error('Error setting biometrics for TOTP access:', error);
      return false;
    }
  }, []);
  
  // Check if biometrics are enabled for TOTP access
  const isBiometricsForTOTPAccessEnabled = useCallback(async (): Promise<boolean> => {
    try {
      return await biometricService.isBiometricsForTOTPAccessEnabled();
    } catch (error) {
      console.error('Error checking if biometrics are enabled for TOTP access:', error);
      return false;
    }
  }, []);

  // Verify email function
  const verifyEmail = useCallback(async (token: string): Promise<AuthResponse> => {
    try {
      const response = await authService.verifyEmail(token);
      
      // If the user is already logged in, update their verification status
      if (user) {
        setUser({ ...user, isEmailVerified: true });
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred during email verification');
    }
  }, [user]);

  // Update profile function
  const updateProfile = useCallback(async (data: { name?: string; email?: string }): Promise<AuthResponse> => {
    try {
      const response = await authService.updateProfile(data);
      if (response.user && user) {
        setUser({ ...user, ...response.user });
      }
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred during profile update');
    }
  }, [user]);

  // Resend verification email function
  const resendVerificationEmail = useCallback(async (): Promise<AuthResponse> => {
    try {
      const response = await authService.resendVerificationEmail();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred while resending verification email');
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated: !!token && !!user,
    // Biometric authentication state
    isBiometricsAvailable,
    isBiometricsEnabled,
    biometryType,
    // Authentication methods
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    resendVerificationEmail,
    refreshAccessToken,
    revokeToken,
    // Biometric authentication methods
    authenticateWithBiometrics,
    enableBiometrics,
    disableBiometrics,
    setBiometricsForAppAccess,
    isBiometricsForAppAccessEnabled,
    setBiometricsForTOTPAccess,
    isBiometricsForTOTPAccessEnabled,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;