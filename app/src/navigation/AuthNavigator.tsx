import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { getTransitionForRoute } from './transitions';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

// Define the authentication stack param list
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#F9F9F9' },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          ...getTransitionForRoute('Login')
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          ...getTransitionForRoute('Register')
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          ...getTransitionForRoute('ForgotPassword')
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          ...getTransitionForRoute('ResetPassword')
        }}
      />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{
          ...getTransitionForRoute('EmailVerification')
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;