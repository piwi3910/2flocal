import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import totpService, { TOTPSecretData } from '../../services/totpService';

type RootStackParamList = {
  TOTPList: undefined;
  ScanQRCode: undefined;
};

type AddTOTPScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const AddTOTPScreen: React.FC = () => {
  const navigation = useNavigation<AddTOTPScreenNavigationProp>();
  
  const [issuer, setIssuer] = useState('');
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (!issuer.trim()) {
      newErrors.issuer = 'Issuer is required';
    }
    
    if (!label.trim()) {
      newErrors.label = 'Label is required';
    }
    
    if (!secret.trim()) {
      newErrors.secret = 'Secret is required';
    } else if (!/^[A-Z2-7]+=*$/i.test(secret.trim())) {
      newErrors.secret = 'Secret must be a valid base32 string';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [issuer, label, secret]);

  // Handle add TOTP
  const handleAddTOTP = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const data: TOTPSecretData = {
        issuer: issuer.trim(),
        label: label.trim(),
        secret: secret.trim().toUpperCase().replace(/\s/g, ''),
      };
      
      await totpService.addSecret(data);
      
      Alert.alert(
        'Success',
        'TOTP account added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TOTPList'),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to add TOTP account'
      );
    } finally {
      setIsLoading(false);
    }
  }, [issuer, label, secret, validateForm, navigation]);

  // Handle scan QR code
  const handleScanQRCode = useCallback(() => {
    navigation.navigate('ScanQRCode');
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Add TOTP Account</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Issuer (Service Name)</Text>
            <TextInput
              style={[styles.input, errors.issuer ? styles.inputError : null]}
              placeholder="e.g., Google, GitHub, Microsoft"
              value={issuer}
              onChangeText={setIssuer}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.issuer ? (
              <Text style={styles.errorText}>{errors.issuer}</Text>
            ) : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Label (Account Name)</Text>
            <TextInput
              style={[styles.input, errors.label ? styles.inputError : null]}
              placeholder="e.g., work@example.com"
              value={label}
              onChangeText={setLabel}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.label ? (
              <Text style={styles.errorText}>{errors.label}</Text>
            ) : null}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Secret Key</Text>
            <TextInput
              style={[styles.input, errors.secret ? styles.inputError : null]}
              placeholder="e.g., JBSWY3DPEHPK3PXP"
              value={secret}
              onChangeText={setSecret}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {errors.secret ? (
              <Text style={styles.errorText}>{errors.secret}</Text>
            ) : null}
            <Text style={styles.helperText}>
              Enter the secret key provided by the service. It's usually a string of letters and numbers.
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleAddTOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Add Account</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.scanButton]}
            onPress={handleScanQRCode}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  scanButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#666666',
    fontSize: 14,
  },
});

export default AddTOTPScreen;