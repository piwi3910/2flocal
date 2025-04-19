/**
 * 2FLocal Mobile App
 * A secure two-factor authentication application
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { AnimationProvider } from './src/context/AnimationContext';
import AppNavigator from './src/navigation/AppNavigator';
import ThemeProvider, { useAppTheme } from './src/theme/ThemeProvider';

// Separate StatusBar component to use the theme context
const ThemedStatusBar = () => {
  const { isDarkMode, theme } = useAppTheme();
  
  return (
    <StatusBar
      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? theme.colors.background : theme.colors.background}
    />
  );
};

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedStatusBar />
        <AnimationProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </AnimationProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default App;
