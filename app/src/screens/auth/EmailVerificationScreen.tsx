import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import FormButton from '../../components/auth/FormButton';
import { useAuth } from '../../context/AuthContext';

// Define the navigation prop type
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string };
};

type EmailVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'EmailVerification'
>;
type EmailVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'EmailVerification'>;

interface EmailVerificationScreenProps {
  navigation: EmailVerificationScreenNavigationProp;
  route: EmailVerificationScreenRouteProp;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { resendVerificationEmail } = useAuth();
  const { email } = route.params;

  // Handle resend verification email
  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      await resendVerificationEmail();
      Alert.alert(
        'Verification Email Sent',
        'A new verification email has been sent to your email address.'
      );
    } catch (error) {
      let errorMessage = 'An error occurred while resending verification email';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Failed to Resend', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification email to <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Please check your email and click on the verification link to complete your registration.
          </Text>
          <Text style={styles.instructionsText}>
            If you don't see the email in your inbox, please check your spam folder.
          </Text>
        </View>

        <FormButton
          title="Resend Verification Email"
          onPress={handleResendEmail}
          isLoading={isLoading}
          disabled={isLoading}
          variant="outline"
        />

        <TouchableOpacity
          style={styles.backToLoginContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#333',
  },
  instructionsContainer: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
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

export default EmailVerificationScreen;