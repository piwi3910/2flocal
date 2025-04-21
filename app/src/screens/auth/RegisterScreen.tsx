import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { StackNavigationProp } from '@react-navigation/stack';

import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { registerSchema } from '../../utils/validationSchemas';
import { useAuth } from '../../context/AuthContext';

// Define the form data type
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Define the navigation prop type
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
};

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  // Initialize form with validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle registration submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await register(data.name, data.email, data.password);
      Alert.alert(
        'Registration Successful',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('EmailVerification', { email: data.email }),
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'An error occurred during registration';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={styles.form}>
          <FormInput
            control={control}
            name="name"
            label="Name"
            placeholder="Enter your full name"
            error={errors.name}
            autoComplete="name"
          />

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
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
            textContentType="newPassword"
            autoComplete="new-password"
          />

          <FormInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
            textContentType="newPassword"
            autoComplete="new-password"
          />

          <FormButton
            title="Sign Up"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
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

export default RegisterScreen;