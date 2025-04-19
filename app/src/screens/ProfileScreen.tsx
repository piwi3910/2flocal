import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { List } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

// Define the navigation prop type
type ProfileStackParamList = {
  ProfileMain: undefined;
  ThemeSettings: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const {
    user,
    logout,
    isBiometricsAvailable,
    isBiometricsEnabled,
    biometryType,
    enableBiometrics,
    disableBiometrics,
    setBiometricsForAppAccess,
    isBiometricsForAppAccessEnabled,
    setBiometricsForTOTPAccess,
    isBiometricsForTOTPAccessEnabled,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [biometricsForAppAccess, setBiometricsForAppAccessState] = useState(false);
  const [biometricsForTOTPAccess, setBiometricsForTOTPAccessState] = useState(false);

  // Load biometric settings
  useEffect(() => {
    const loadBiometricSettings = async () => {
      try {
        setIsLoading(true);
        const appAccess = await isBiometricsForAppAccessEnabled();
        const totpAccess = await isBiometricsForTOTPAccessEnabled();
        
        setBiometricsForAppAccessState(appAccess);
        setBiometricsForTOTPAccessState(totpAccess);
      } catch (error) {
        console.error('Error loading biometric settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isBiometricsEnabled) {
      loadBiometricSettings();
    }
  }, [isBiometricsEnabled, isBiometricsForAppAccessEnabled, isBiometricsForTOTPAccessEnabled]);

  // Handle biometrics toggle
  const handleBiometricsToggle = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isBiometricsEnabled) {
        // Disable biometrics
        const success = await disableBiometrics();
        if (!success) {
          Alert.alert('Error', 'Failed to disable biometric authentication');
        }
      } else {
        // Enable biometrics
        const success = await enableBiometrics();
        if (!success) {
          Alert.alert('Error', 'Failed to enable biometric authentication');
        }
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      Alert.alert('Error', 'An error occurred while toggling biometric authentication');
    } finally {
      setIsLoading(false);
    }
  }, [isBiometricsEnabled, enableBiometrics, disableBiometrics]);

  // Handle app access toggle
  const handleAppAccessToggle = useCallback(async (value: boolean) => {
    try {
      setIsLoading(true);
      const success = await setBiometricsForAppAccess(value);
      
      if (success) {
        setBiometricsForAppAccessState(value);
      } else {
        Alert.alert('Error', 'Failed to update app access setting');
      }
    } catch (error) {
      console.error('Error toggling app access:', error);
      Alert.alert('Error', 'An error occurred while updating app access setting');
    } finally {
      setIsLoading(false);
    }
  }, [setBiometricsForAppAccess]);

  // Handle TOTP access toggle
  const handleTOTPAccessToggle = useCallback(async (value: boolean) => {
    try {
      setIsLoading(true);
      const success = await setBiometricsForTOTPAccess(value);
      
      if (success) {
        setBiometricsForTOTPAccessState(value);
      } else {
        Alert.alert('Error', 'Failed to update TOTP access setting');
      }
    } catch (error) {
      console.error('Error toggling TOTP access:', error);
      Alert.alert('Error', 'An error occurred while updating TOTP access setting');
    } finally {
      setIsLoading(false);
    }
  }, [setBiometricsForTOTPAccess]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'An error occurred while logging out');
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Get biometry type display name
  const getBiometryTypeDisplay = useCallback(() => {
    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Biometrics':
        return 'Fingerprint';
      default:
        return 'Biometric Authentication';
    }
  }, [biometryType]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || 'Not set'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Email Verified</Text>
          <Text style={styles.value}>{user?.isEmailVerified ? 'Yes' : 'No'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('ThemeSettings')}
        >
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Theme Settings</Text>
            <Text style={styles.settingDescription}>
              Customize app appearance and dark mode
            </Text>
          </View>
          <List.Icon icon="chevron-right" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {isBiometricsAvailable ? (
          <>
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{getBiometryTypeDisplay()}</Text>
                <Text style={styles.settingDescription}>
                  Use {getBiometryTypeDisplay()} to authenticate
                </Text>
              </View>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={handleBiometricsToggle}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isBiometricsEnabled ? '#0066CC' : '#f4f3f4'}
              />
            </View>

            {isBiometricsEnabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>App Access</Text>
                    <Text style={styles.settingDescription}>
                      Require {getBiometryTypeDisplay()} to access the app
                    </Text>
                  </View>
                  <Switch
                    value={biometricsForAppAccess}
                    onValueChange={handleAppAccessToggle}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={biometricsForAppAccess ? '#0066CC' : '#f4f3f4'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>TOTP Access</Text>
                    <Text style={styles.settingDescription}>
                      Require {getBiometryTypeDisplay()} to view TOTP codes
                    </Text>
                  </View>
                  <Switch
                    value={biometricsForTOTPAccess}
                    onValueChange={handleTOTPAccessToggle}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={biometricsForTOTPAccess ? '#0066CC' : '#f4f3f4'}
                  />
                </View>
              </>
            )}
          </>
        ) : (
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>
                Biometric authentication is not available on this device
              </Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginVertical: 20,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;