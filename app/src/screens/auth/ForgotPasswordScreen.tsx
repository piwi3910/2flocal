import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { StackNavigationProp } from '@react-navigation/stack';

import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import { useAuth } from '../../context/AuthContext';

// Define the form data type
interface ForgotPasswordFormData {
  email: string;
}

// Define the navigation prop type
type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();

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
      await forgotPassword(data.email);
      Alert.alert(
        'Password Reset Email Sent',
        'If your email is registered, you will receive a password reset link.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'An error occurred while requesting password reset';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Request Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to reset your password</Text>

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
            title="Send Reset Link"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
          />

          <TouchableOpacity
            style={styles.backToLoginContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
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
  backToLoginContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;