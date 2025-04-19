import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';

import AuthNavigator from './AuthNavigator';
import { useAuth } from '../context/AuthContext';

// Import TOTP screens
import TOTPListScreen from '../screens/totp/TOTPListScreen';
import TOTPDetailScreen from '../screens/totp/TOTPDetailScreen';
import AddTOTPScreen from '../screens/totp/AddTOTPScreen';
import ScanQRCodeScreen from '../screens/totp/ScanQRCodeScreen';

// Import Profile screen
import ProfileScreen from '../screens/ProfileScreen';

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
        options={{ title: 'TOTP Details' }}
      />
      <TOTPStack.Screen
        name="AddTOTP"
        component={AddTOTPScreen}
        options={{ title: 'Add TOTP Account' }}
      />
      <TOTPStack.Screen
        name="ScanQRCode"
        component={ScanQRCodeScreen}
        options={{
          title: 'Scan QR Code',
          headerShown: false,
        }}
      />
    </TOTPStack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator>
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
        component={ProfileScreen}
        options={{ title: 'Profile' }}
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