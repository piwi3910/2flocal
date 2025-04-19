import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, CameraType } from 'react-native-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import totpService, { TOTPUriData, TOTPSecretData } from '../../services/totpService';

type RootStackParamList = {
  TOTPList: undefined;
  AddTOTP: undefined;
};

type ScanQRCodeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ScanQRCodeScreen: React.FC = () => {
  const navigation = useNavigation<ScanQRCodeScreenNavigationProp>();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Request camera permission
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const permission = Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.CAMERA 
          : PERMISSIONS.ANDROID.CAMERA;
        
        const result = await request(permission);
        setHasPermission(result === RESULTS.GRANTED);
        
        if (result !== RESULTS.GRANTED) {
          Alert.alert(
            'Camera Permission',
            'Camera permission is required to scan QR codes.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        setHasPermission(false);
        Alert.alert(
          'Error',
          'Failed to request camera permission.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    };

    requestCameraPermission();
  }, [navigation]);

  // Handle QR code scan
  const handleQRCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (!scanning || processing) return;
    
    setScanning(false);
    setProcessing(true);
    
    try {
      // Check if the QR code contains a TOTP URI
      if (data.startsWith('otpauth://')) {
        // Parse the QR code directly
        const parsedData: TOTPUriData = {
          uri: data,
          secret: '',
          issuer: '',
          label: '',
        };
        
        // Extract secret, issuer, and label from the URI
        const uriParams = new URL(data);
        const path = uriParams.pathname.substring(1); // Remove leading slash
        
        // Extract label and issuer from path
        if (path.includes(':')) {
          const [issuer, label] = path.split(':');
          parsedData.issuer = decodeURIComponent(issuer);
          parsedData.label = decodeURIComponent(label);
        } else {
          parsedData.label = decodeURIComponent(path);
        }
        
        // Extract secret from query parameters
        const params = uriParams.searchParams;
        parsedData.secret = params.get('secret') || '';
        
        // If issuer is not in path, check query parameters
        if (!parsedData.issuer) {
          parsedData.issuer = params.get('issuer') || '';
        }
        
        // Add the TOTP account
        if (parsedData.secret) {
          const secretData: TOTPSecretData = {
            issuer: parsedData.issuer,
            label: parsedData.label,
            secret: parsedData.secret,
          };
          
          await totpService.addSecret(secretData);
          
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
        } else {
          throw new Error('Invalid QR code: No secret found');
        }
      } else {
        // If not a direct TOTP URI, try to parse it using the backend
        const base64Image = await convertQRCodeToBase64(data);
        const parsedData = await totpService.parseQRCode(base64Image);
        
        const secretData: TOTPSecretData = {
          issuer: parsedData.issuer,
          label: parsedData.label,
          secret: parsedData.secret,
        };
        
        await totpService.addSecret(secretData);
        
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
      }
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to process QR code',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanning(true);
              setProcessing(false);
            },
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } finally {
      setProcessing(false);
    }
  }, [scanning, processing, navigation]);

  // Convert QR code to base64
  const convertQRCodeToBase64 = async (qrCodeData: string): Promise<string> => {
    // This is a placeholder function
    // In a real implementation, you would capture the QR code image and convert it to base64
    // For now, we'll just return the QR code data
    return qrCodeData;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={CameraType.back}
        onBarCodeRead={scanning ? handleQRCodeScanned : undefined}
        barCodeTypes={['qr']}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
        
        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.processingText}>Processing QR code...</Text>
          </View>
        )}
      </Camera>
      
      <View style={styles.footer}>
        <Text style={styles.instructions}>
          Position the QR code within the square to scan it
        </Text>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#000000',
  },
  instructions: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScanQRCodeScreen;