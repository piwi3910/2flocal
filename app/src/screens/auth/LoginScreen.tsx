import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { StackNavigationProp } from '@react-navigation/stack';

import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { loginSchema } from '../../utils/validationSchemas';
import { useAuth } from '../../context/AuthContext';
import biometricService from '../../services/biometricService';

// Define the form data type
interface LoginFormData {
  email: string;
  password: string;
}

// Define the navigation prop type
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showBiometricButton, setShowBiometricButton] = useState(false);
  const { login, authenticateWithBiometrics } = useAuth();

  // Check if biometric authentication is available and enabled
  useEffect(() => {
    const checkBiometricAuth = async () => {
      try {
        // Check if biometrics are available on the device
        const { available } = await biometricService.isBiometricAvailable();

        if (available) {
          // Check if biometrics are enabled for app access
          const enabled = await biometricService.isBiometricsEnabled();
          const appAccessEnabled = await biometricService.isBiometricsForAppAccessEnabled();

          setShowBiometricButton(enabled && appAccessEnabled);
        }
      } catch (error) {
        console.error('Error checking biometric authentication:', error);
      }
    };

    checkBiometricAuth();
  }, []);

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      setIsBiometricLoading(true);
      const success = await authenticateWithBiometrics('Unlock 2FLocal');

      if (success) {
        // Biometric authentication successful
        // The AuthContext will handle redirecting to the main app
      } else {
        // Biometric authentication failed or was canceled
        Alert.alert(
          'Authentication Failed',
          'Biometric authentication failed. Please try again or use your email and password.'
        );
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      Alert.alert(
        'Authentication Error',
        'An error occurred during biometric authentication. Please try again or use your email and password.'
      );
    } finally {
      setIsBiometricLoading(false);
    }
  };

  // Initialize form with validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle login submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      // No need to navigate - the AuthContext will handle redirecting to the main app
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.form}>
          {showBiometricButton && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              disabled={isBiometricLoading}
            >
              <View style={styles.biometricButtonContent}>
                {isBiometricLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.biometricButtonText}>
                      Sign in with Biometrics
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}

          {showBiometricButton && (
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>
          )}

          <FormInput
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
            autoCapitalize="none"
            autoComplete="email"
          />

          <FormInput
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
            textContentType="password"
            autoComplete="current-password"
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <FormButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  biometricButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  biometricButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
