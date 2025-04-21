import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            title: 'Sign In',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: 'Sign Up',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            title: 'Forgot Password',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="reset-password"
          options={{
            title: 'Reset Password',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="email-verification"
          options={{
            title: 'Email Verification',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}