import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import authService from '../../services/authService';

// Define the form data type
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form with validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Handle reset password submission
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      Alert.alert('Error', 'Reset token is missing. Please try again with a valid reset link.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ token, password: data.password });
      setIsSuccess(true);
    } catch (error) {
      let errorMessage = 'An error occurred while resetting your password';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render success message after password reset
  if (isSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Text style={styles.title}>Password Reset Successful</Text>
          <Text style={styles.message}>
            Your password has been successfully reset. You can now log in with your new password.
          </Text>

          <View style={styles.buttonContainer}>
            <FormButton
              title="Go to Login"
              onPress={() => router.push('/auth/login')}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    );
  }

  // Render the form
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Create a new password for your account.
        </Text>

        <View style={styles.form}>
          <FormInput
            control={control}
            name="password"
            label="New Password"
            placeholder="Enter your new password"
            secureTextEntry
            error={errors.password}
            textContentType="newPassword"
            autoComplete="new-password"
          />

          <FormInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your new password"
            secureTextEntry
            error={errors.confirmPassword}
            textContentType="newPassword"
            autoComplete="new-password"
          />

          <FormButton
            title="Reset Password"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});