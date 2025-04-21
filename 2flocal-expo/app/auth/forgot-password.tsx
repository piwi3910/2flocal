import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import authService from '../../services/authService';

// Define the form data type
interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Initialize form with validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle forgot password submission
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      let errorMessage = 'An error occurred while requesting password reset';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the success message after submission
  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.message}>
            We've sent password reset instructions to:
          </Text>
          <Text style={styles.email}>{submittedEmail}</Text>
          <Text style={styles.instructions}>
            Please check your email and follow the link to reset your password.
          </Text>

          <View style={styles.buttonContainer}>
            <FormButton
              title="Back to Login"
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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.form}>
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

          <FormButton
            title="Send Reset Instructions"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
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
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0066CC',
    marginBottom: 24,
  },
  instructions: {
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