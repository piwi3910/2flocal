import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';

import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';
import { getTransitionForRoute, tabTransition } from './transitions';

// Import TOTP screens
import TOTPListScreen from '../screens/totp/TOTPListScreen';
import TOTPDetailScreen from '../screens/totp/TOTPDetailScreen';
import AddTOTPScreen from '../screens/totp/AddTOTPScreen';
import ScanQRCodeScreen from '../screens/totp/ScanQRCodeScreen';

// Import Profile and Theme Settings screens
import ProfileScreen from '../screens/ProfileScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';

// Define the root stack param list
type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Define the main tab param list
type MainTabParamList = {
  TOTPStack: undefined;
  Profile: undefined;
};

// Define the profile stack param list
type ProfileStackParamList = {
  ProfileMain: undefined;
  ThemeSettings: undefined;
};

// Define the TOTP stack param list
type TOTPStackParamList = {
  TOTPList: undefined;
  TOTPDetail: { secretId: string };
  AddTOTP: undefined;
  ScanQRCode: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const TOTPStack = createStackNavigator<TOTPStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// TOTP Stack Navigator
const TOTPStackNavigator: React.FC = () => {
  return (
    <TOTPStack.Navigator>
      <TOTPStack.Screen
        name="TOTPList"
        component={TOTPListScreen}
        options={{ title: 'TOTP Codes' }}
      />
      <TOTPStack.Screen
        name="TOTPDetail"
        component={TOTPDetailScreen}
        options={{
          title: 'TOTP Details',
          ...getTransitionForRoute('TOTPDetail')
        }}
      />
      <TOTPStack.Screen
        name="AddTOTP"
        component={AddTOTPScreen}
        options={{
          title: 'Add TOTP Account',
          ...getTransitionForRoute('AddTOTP')
        }}
      />
      <TOTPStack.Screen
        name="ScanQRCode"
        component={ScanQRCodeScreen}
        options={{
          title: 'Scan QR Code',
          headerShown: false,
          ...getTransitionForRoute('ScanQRCode')
        }}
      />
    </TOTPStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
        options={{
          title: 'Theme Settings',
          ...getTransitionForRoute('ThemeSettings')
        }}
      />
    </ProfileStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={{
        ...tabTransition
      }}
    >
      <MainTab.Screen
        name="TOTPStack"
        component={TOTPStackNavigator}
        options={{
          title: 'TOTP Codes',
          headerShown: false,
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          title: 'Profile',
          headerShown: false
        }}
      />
    </MainTab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a loading screen while checking authentication state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // User is signed in
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // User is not signed in
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});

export default AppNavigator;