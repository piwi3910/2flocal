import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import { useAuth } from '../../context/AuthContext';

// Define the form data type
interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Define the navigation prop type
type AuthStackParamList = {
  Login: undefined;
  ResetPassword: { token: string };
};

type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { token } = route.params;

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
    try {
      setIsLoading(true);
      await resetPassword(token, data.password);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      let errorMessage = 'An error occurred while resetting your password';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Reset Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Create a new password for your account</Text>

        <View style={styles.form}>
          <FormInput
            control={control}
            name="password"
            label="New Password"
            placeholder="Enter your new password"
            secureTextEntry
            error={errors.password}
          />

          <FormInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your new password"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <FormButton
            title="Reset Password"
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

export default ResetPasswordScreen;