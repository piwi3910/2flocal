import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import TOTPCode from '../../components/totp/TOTPCode';
import totpService, { TOTPSecret, TOTPCode as TOTPCodeType } from '../../services/totpService';

type RootStackParamList = {
  TOTPDetail: { secretId: string };
  TOTPList: undefined;
};

type TOTPDetailScreenRouteProp = RouteProp<RootStackParamList, 'TOTPDetail'>;
type TOTPDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const TOTPDetailScreen: React.FC = () => {
  const navigation = useNavigation<TOTPDetailScreenNavigationProp>();
  const route = useRoute<TOTPDetailScreenRouteProp>();
  const { secretId } = route.params;

  const [secret, setSecret] = useState<TOTPSecret | null>(null);
  const [totpData, setTotpData] = useState<TOTPCodeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch secret details
  const fetchSecretDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all secrets and find the one with matching ID
      const secrets = await totpService.getSecrets();
      const foundSecret = secrets.find(s => s.id === secretId);
      
      if (!foundSecret) {
        throw new Error('TOTP secret not found');
      }
      
      setSecret(foundSecret);
      
      // Get the TOTP code
      const code = await totpService.getTOTPCode(secretId);
      setTotpData(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch TOTP details');
    } finally {
      setIsLoading(false);
    }
  }, [secretId]);

  // Initial fetch
  useEffect(() => {
    fetchSecretDetails();
  }, [fetchSecretDetails]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!secret) return;
    
    try {
      const qrCodeData = await totpService.generateQRCode(secretId);
      await Share.share({
        message: `TOTP Secret for ${secret.issuer} (${secret.label}): ${qrCodeData.uri}`,
        url: qrCodeData.qrCode,
        title: `${secret.issuer} TOTP Secret`,
      });
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to share TOTP secret'
      );
    }
  }, [secret, secretId]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (!secret) return;
    
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete ${secret.issuer} (${secret.label})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await totpService.deleteSecret(secretId);
              navigation.goBack();
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete TOTP secret'
              );
            }
          }
        }
      ]
    );
  }, [secret, secretId, navigation]);

  // Get TOTP code
  const getTOTPCode = useCallback(async (id: string) => {
    return totpService.getTOTPCode(id);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchSecretDetails}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!secret) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>TOTP secret not found</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{secret.issuer}</Text>
        <Text style={styles.subtitle}>{secret.label}</Text>
      </View>
      
      <View style={styles.codeContainer}>
        <TOTPCode
          secretId={secretId}
          onGetTOTPCode={getTOTPCode}
          initialTOTPData={totpData || undefined}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Issuer:</Text>
          <Text style={styles.infoValue}>{secret.issuer}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Label:</Text>
          <Text style={styles.infoValue}>{secret.label}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>
            {new Date(secret.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.shareButton]} 
          onPress={handleShare}
        >
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]} 
          onPress={handleDelete}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  codeContainer: {
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#0066CC',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FFE0E0',
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
  },
});

export default TOTPDetailScreen;