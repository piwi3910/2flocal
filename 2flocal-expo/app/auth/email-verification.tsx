import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import FormButton from '../../components/auth/FormButton';
import authService from '../../services/authService';

export default function EmailVerificationScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isResending, setIsResending] = useState(false);

  // Handle resend verification email
  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await authService.resendVerificationEmail();
      Alert.alert(
        'Verification Email Sent',
        'A new verification email has been sent to your email address.'
      );
    } catch (error) {
      let errorMessage = 'An error occurred while resending the verification email';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.message}>
          We've sent a verification email to:
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.instructions}>
          Please check your email and click on the verification link to complete your registration.
        </Text>

        <View style={styles.buttonContainer}>
          <FormButton
            title="Resend Verification Email"
            variant="outline"
            onPress={handleResendVerification}
            isLoading={isResending}
            disabled={isResending}
            style={styles.button}
          />
          
          <FormButton
            title="Back to Login"
            variant="secondary"
            onPress={() => router.push('/auth/login')}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0066CC',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    marginBottom: 16,
  },
});