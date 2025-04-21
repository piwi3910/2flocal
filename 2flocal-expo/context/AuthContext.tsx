import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import authService, { User as ApiUser, setAuthToken } from '../services/authService';
import { secureStorage, SecureStorageKeys } from '../services/secureStorageService';
import biometricService from '../services/biometricService';
import { database, syncDatabase } from '../database';
import NetInfo from '@react-native-community/netinfo';
import { User as DbUser } from '../database/models';

// Combine API User and DB User types
type User = ApiUser;

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authenticateWithBiometrics: (promptMessage: string) => Promise<boolean>;
  updateUser: (user: User) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  authenticateWithBiometrics: async () => false,
  updateUser: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // State to track network connectivity
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First, try to get user from local database (for offline access)
        const usersCollection = database.get<DbUser>('users');
        const localUsers = await usersCollection.query().fetch();
        
        if (localUsers.length > 0) {
          // User exists in local database, use it for offline authentication
          const localUser = localUsers[0];
          const userData: User = {
            id: localUser.id,
            email: localUser.email,
            name: localUser.name || null,
            isEmailVerified: localUser.isEmailVerified,
            createdAt: localUser.createdAt.toISOString(),
            updatedAt: localUser.updatedAt.toISOString(),
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          
          // If we're online, try to sync with the server
          if (isConnected) {
            const token = await secureStorage.getItem(SecureStorageKeys.ACCESS_TOKEN);
            
            if (token) {
              setAuthToken(token);
              try {
                // Sync database with server
                await syncDatabase();
                
                // Get fresh user data from server
                const serverUserData = await authService.getCurrentUser();
                setUser(serverUserData);
              } catch (error) {
                console.error('Error syncing with server:', error);
                // Continue with local data if sync fails
              }
            } else {
              // Try to refresh the token
              try {
                const refreshResponse = await authService.refreshToken();
                if (refreshResponse.accessToken) {
                  setAuthToken(refreshResponse.accessToken);
                  await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, refreshResponse.accessToken);
                  
                  // Sync database with server
                  await syncDatabase();
                  
                  // Get fresh user data from server
                  const serverUserData = await authService.getCurrentUser();
                  setUser(serverUserData);
                }
              } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                // Continue with local data if refresh fails
              }
            }
          }
        } else {
          // No local user, try online authentication
          if (isConnected) {
            const token = await secureStorage.getItem(SecureStorageKeys.ACCESS_TOKEN);
            
            if (token) {
              // Set the token in the API client
              setAuthToken(token);
              
              try {
                // Get the user data from server
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
                
                // Save user to local database for offline access
                await saveUserToLocalDatabase(userData);
              } catch (error) {
                console.error('Error getting user data:', error);
                
                // Try to refresh the token
                try {
                  const refreshResponse = await authService.refreshToken();
                  if (refreshResponse.accessToken) {
                    setAuthToken(refreshResponse.accessToken);
                    await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, refreshResponse.accessToken);
                    
                    // Try to get user data again
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                    
                    // Save user to local database for offline access
                    await saveUserToLocalDatabase(userData);
                  } else {
                    // Clear auth state if refresh fails
                    await handleLogout();
                  }
                } catch (refreshError) {
                  console.error('Error refreshing token:', refreshError);
                  await handleLogout();
                }
              }
            } else {
              // Check if biometric authentication is enabled for app access
              const biometricEnabled = await biometricService.isBiometricsEnabled();
              const biometricAppAccessEnabled = await biometricService.isBiometricsForAppAccessEnabled();
              
              if (biometricEnabled && biometricAppAccessEnabled) {
                // Try to authenticate with biometrics
                const success = await biometricService.authenticate('Unlock 2FLocal');
                
                if (success) {
                  // Try to refresh the token
                  try {
                    const refreshResponse = await authService.refreshToken();
                    if (refreshResponse.accessToken) {
                      setAuthToken(refreshResponse.accessToken);
                      await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, refreshResponse.accessToken);
                      
                      // Get user data
                      const userData = await authService.getCurrentUser();
                      setUser(userData);
                      setIsAuthenticated(true);
                      
                      // Save user to local database for offline access
                      await saveUserToLocalDatabase(userData);
                    }
                  } catch (error) {
                    console.error('Error refreshing token after biometric auth:', error);
                    setIsAuthenticated(false);
                  }
                } else {
                  setIsAuthenticated(false);
                }
              } else {
                setIsAuthenticated(false);
              }
            }
          } else {
            // No local user and offline
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [isConnected]);
  
  // Helper function to save user to local database
  const saveUserToLocalDatabase = async (userData: User) => {
    try {
      const usersCollection = database.get<DbUser>('users');
      
      // Check if user already exists in database
      const existingUsers = await usersCollection.query().fetch();
      
      if (existingUsers.length > 0) {
        // Update existing user
        await database.write(async () => {
          await existingUsers[0].update(user => {
            user.email = userData.email;
            user.name = userData.name || undefined;
            user.isEmailVerified = userData.isEmailVerified;
            user.updatedAt = new Date();
            user.lastSyncedAt = new Date();
          });
        });
      } else {
        // Create new user
        await database.write(async () => {
          await usersCollection.create(user => {
            user.email = userData.email;
            user.name = userData.name || undefined;
            user.isEmailVerified = userData.isEmailVerified;
            user.createdAt = new Date();
            user.updatedAt = new Date();
            user.lastSyncedAt = new Date();
          });
        });
      }
    } catch (error) {
      console.error('Error saving user to local database:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if we're online
      if (!isConnected) {
        throw new Error('Cannot login while offline. Please check your internet connection.');
      }
      
      const response = await authService.login({ email, password });
      
      if (response.accessToken) {
        await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, response.accessToken);
        
        let userData: User;
        if (response.user) {
          userData = response.user;
        } else {
          // If user data is not included in the response, fetch it
          userData = await authService.getCurrentUser();
        }
        
        // Save user data to local database for offline access
        await saveUserToLocalDatabase(userData);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Sync database with server
        await syncDatabase();
        
        router.replace('/(tabs)');
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if we're online
      if (!isConnected) {
        throw new Error('Cannot register while offline. Please check your internet connection.');
      }
      
      await authService.register({ name, email, password });
      // Note: We don't automatically log in after registration because email verification may be required
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // If online, logout from server
      if (isConnected) {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Server logout error:', error);
          // Continue with local logout even if server logout fails
        }
      }
      
      // Clear tokens
      await secureStorage.removeItem(SecureStorageKeys.ACCESS_TOKEN);
      await secureStorage.removeItem(SecureStorageKeys.USER_DATA);
      
      // Clear local database
      try {
        await database.write(async () => {
          // Delete all users
          const usersCollection = database.get<DbUser>('users');
          const users = await usersCollection.query().fetch();
          for (const user of users) {
            await user.destroyPermanently();
          }
          
          // Delete all TOTP codes
          const totpCollection = database.get('totp_codes');
          const totpCodes = await totpCollection.query().fetch();
          for (const code of totpCodes) {
            await code.destroyPermanently();
          }
        });
      } catch (dbError) {
        console.error('Error clearing local database:', dbError);
      }
      
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate with biometrics
  const authenticateWithBiometrics = async (promptMessage: string): Promise<boolean> => {
    try {
      // Check if biometrics are available and enabled
      const { available } = await biometricService.isBiometricAvailable();
      const enabled = await biometricService.isBiometricsEnabled();
      
      if (!available || !enabled) {
        return false;
      }
      
      // Authenticate with biometrics
      const success = await biometricService.authenticate(promptMessage);
      
      if (success) {
        // If already authenticated, just return success
        if (isAuthenticated) {
          return true;
        }
        
        // Try to refresh the token
        try {
          const refreshResponse = await authService.refreshToken();
          if (refreshResponse.accessToken) {
            setAuthToken(refreshResponse.accessToken);
            await secureStorage.setItem(SecureStorageKeys.ACCESS_TOKEN, refreshResponse.accessToken);
            
            // Get user data
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            router.replace('/(tabs)');
            return true;
          }
        } catch (error) {
          console.error('Error refreshing token after biometric auth:', error);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  // Update user data
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    secureStorage.setItem(SecureStorageKeys.USER_DATA, JSON.stringify(updatedUser));
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout: handleLogout,
    authenticateWithBiometrics,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};