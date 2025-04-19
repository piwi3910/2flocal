import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Share,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import TOTPItem from '../../components/totp/TOTPItem';
import SearchBar from '../../components/totp/SearchBar';
import EmptyState from '../../components/totp/EmptyState';
import totpService, { TOTPSecret } from '../../services/totpService';
import { useAuth } from '../../context/AuthContext';
import biometricService from '../../services/biometricService';

type RootStackParamList = {
  TOTPDetail: { secretId: string };
  AddTOTP: undefined;
  ScanQRCode: undefined;
};

type TOTPListScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TOTPListScreen: React.FC = () => {
  const navigation = useNavigation<TOTPListScreenNavigationProp>();
  const { authenticateWithBiometrics } = useAuth();
  const [secrets, setSecrets] = useState<TOTPSecret[]>([]);
  const [filteredSecrets, setFilteredSecrets] = useState<TOTPSecret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Fetch TOTP secrets
  const fetchSecrets = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const data = await totpService.getSecrets();
      setSecrets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch TOTP secrets');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Check if biometric authentication is required for TOTP access
  useEffect(() => {
    const checkBiometricAuth = async () => {
      try {
        // Check if biometrics are available on the device
        const { available } = await biometricService.isBiometricAvailable();
        
        if (available) {
          // Check if biometrics are enabled for TOTP access
          const enabled = await biometricService.isBiometricsEnabled();
          const totpAccessEnabled = await biometricService.isBiometricsForTOTPAccessEnabled();
          
          if (enabled && totpAccessEnabled) {
            setShowBiometricModal(true);
          } else {
            // No biometric authentication required, proceed
            setIsAuthenticated(true);
          }
        } else {
          // Biometrics not available, proceed
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking biometric authentication:', error);
        // Proceed anyway in case of error
        setIsAuthenticated(true);
      }
    };
    
    checkBiometricAuth();
  }, []);
  
  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      setIsBiometricLoading(true);
      const success = await authenticateWithBiometrics('Authenticate to view TOTP codes');
      
      if (success) {
        // Biometric authentication successful
        setIsAuthenticated(true);
        setShowBiometricModal(false);
        // Fetch secrets after successful authentication
        fetchSecrets();
      } else {
        // Biometric authentication failed or was canceled
        Alert.alert(
          'Authentication Failed',
          'Biometric authentication failed. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      Alert.alert(
        'Authentication Error',
        'An error occurred during biometric authentication. Please try again.'
      );
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // Initial fetch - only if authenticated or biometrics not required
  useEffect(() => {
    if (isAuthenticated) {
      fetchSecrets();
    }
  }, [isAuthenticated, fetchSecrets]);

  // Filter secrets based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSecrets(secrets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = secrets.filter(
      (secret) =>
        secret.issuer.toLowerCase().includes(query) ||
        secret.label.toLowerCase().includes(query)
    );
    setFilteredSecrets(filtered);
  }, [secrets, searchQuery]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchSecrets(true);
  }, [fetchSecrets]);

  // Handle item press
  const handleItemPress = useCallback((item: TOTPSecret) => {
    navigation.navigate('TOTPDetail', { secretId: item.id });
  }, [navigation]);

  // Handle delete
  const handleDelete = useCallback(async (item: TOTPSecret) => {
    try {
      await totpService.deleteSecret(item.id);
      setSecrets((prevSecrets) => prevSecrets.filter((secret) => secret.id !== item.id));
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to delete TOTP secret'
      );
    }
  }, []);

  // Handle share
  const handleShare = useCallback(async (item: TOTPSecret) => {
    try {
      const qrCodeData = await totpService.generateQRCode(item.id);
      await Share.share({
        message: `TOTP Secret for ${item.issuer} (${item.label}): ${qrCodeData.uri}`,
        url: qrCodeData.qrCode,
        title: `${item.issuer} TOTP Secret`,
      });
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to share TOTP secret'
      );
    }
  }, []);

  // Handle add new TOTP
  const handleAddTOTP = useCallback(() => {
    navigation.navigate('AddTOTP');
  }, [navigation]);

  // Handle scan QR code
  const handleScanQRCode = useCallback(() => {
    navigation.navigate('ScanQRCode');
  }, [navigation]);

  // Render empty state
  const renderEmptyState = useMemo(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" testID="loading-indicator" />
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          title="Error"
          message={error}
          buttonText="Try Again"
          onButtonPress={() => fetchSecrets()}
        />
      );
    }

    if (secrets.length === 0) {
      return (
        <EmptyState
          title="No TOTP Accounts"
          message="You don't have any TOTP accounts yet. Add one to get started."
          buttonText="Add Account"
          onButtonPress={handleAddTOTP}
        />
      );
    }

    if (filteredSecrets.length === 0) {
      return (
        <EmptyState
          title="No Results"
          message={`No accounts found matching "${searchQuery}"`}
          buttonText="Clear Search"
          onButtonPress={() => setSearchQuery('')}
        />
      );
    }

    return null;
  }, [isLoading, error, secrets.length, filteredSecrets.length, searchQuery, fetchSecrets, handleAddTOTP]);

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      
      <FlatList
        data={filteredSecrets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TOTPItem
            item={item}
            onPress={handleItemPress}
            onDelete={handleDelete}
            onShare={handleShare}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.scanButton]}
          onPress={handleScanQRCode}
        >
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAddTOTP}
        >
          <Text style={styles.buttonText}>Add Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Biometric Authentication Modal */}
      <Modal
        visible={showBiometricModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Authentication Required</Text>
            <Text style={styles.modalText}>
              Please authenticate using biometrics to view your TOTP codes.
            </Text>
            <TouchableOpacity
              style={styles.authButton}
              onPress={handleBiometricAuth}
              disabled={isBiometricLoading}
            >
              {isBiometricLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.authButtonText}>Authenticate</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#0066CC',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#34C759',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  authButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TOTPListScreen;