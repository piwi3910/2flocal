import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useColorScheme, Appearance, Animated } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { customLightTheme, customDarkTheme, customOledDarkTheme, ThemeType, DarkModeType, CustomThemeColors } from './theme';
import secureStorage from '../services/secureStorageService';

// Define secure storage keys for theme preferences
const THEME_TYPE_KEY = 'themeType';
const DARK_MODE_TYPE_KEY = 'darkModeType';

interface ThemeContextType {
  theme: CustomThemeColors;
  themeType: ThemeType;
  darkModeType: DarkModeType;
  setThemeType: (type: ThemeType) => void;
  setDarkModeType: (type: DarkModeType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the theme context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: customLightTheme,
  themeType: 'system',
  darkModeType: 'dark',
  setThemeType: () => {},
  setDarkModeType: () => {},
  isDarkMode: false,
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useAppTheme = () => useContext(ThemeContext);

// ThemeProvider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the device color scheme
  const colorScheme = useColorScheme();
  
  // State for the theme type (light, dark, or system)
  const [themeType, setThemeType] = useState<ThemeType>('system');
  
  // State for dark mode type (dark or oled)
  const [darkModeType, setDarkModeType] = useState<DarkModeType>('dark');
  
  // Animation value for smooth transitions
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // Function to animate theme changes
  const animateThemeChange = useCallback(() => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnim]);
  
  // Load saved preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const savedThemeType = await secureStorage.getItem(THEME_TYPE_KEY);
        const savedDarkModeType = await secureStorage.getItem(DARK_MODE_TYPE_KEY);
        
        if (savedThemeType) {
          setThemeType(savedThemeType as ThemeType);
        }
        
        if (savedDarkModeType) {
          setDarkModeType(savedDarkModeType as DarkModeType);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };
    
    loadThemePreferences();
  }, []);
  
  // Save preferences when they change
  useEffect(() => {
    const saveThemePreferences = async () => {
      try {
        await secureStorage.setItem(THEME_TYPE_KEY, themeType);
        await secureStorage.setItem(DARK_MODE_TYPE_KEY, darkModeType);
      } catch (error) {
        console.error('Error saving theme preferences:', error);
      }
    };
    
    saveThemePreferences();
  }, [themeType, darkModeType]);
  
  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: _ }) => {
      if (themeType === 'system') {
        // Animate theme change when system theme changes
        animateThemeChange();
      }
    });
    
    return () => subscription.remove();
  }, [themeType, animateThemeChange]);
  
  // Determine if dark mode is active based on theme type and system preference
  const isDarkMode =
    themeType === 'dark' || (themeType === 'system' && colorScheme === 'dark');
  
  // Select the appropriate theme
  const theme = isDarkMode
    ? (darkModeType === 'oled' ? customOledDarkTheme : customDarkTheme)
    : customLightTheme;
  
  
  // Function to set theme type with animation
  const handleSetThemeType = (type: ThemeType) => {
    animateThemeChange();
    setThemeType(type);
  };
  
  // Function to set dark mode type with animation
  const handleSetDarkModeType = (type: DarkModeType) => {
    animateThemeChange();
    setDarkModeType(type);
  };
  
  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    animateThemeChange();
    setThemeType(prevThemeType => {
      if (prevThemeType === 'system') {
        return isDarkMode ? 'light' : 'dark';
      } else {
        return prevThemeType === 'light' ? 'dark' : 'light';
      }
    });
  };

  // Provide the theme context and Paper provider
  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        darkModeType,
        setThemeType: handleSetThemeType,
        setDarkModeType: handleSetDarkModeType,
        isDarkMode,
        toggleTheme
      }}
    >
      <PaperProvider theme={theme}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {children}
        </Animated.View>
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Export default ThemeProvider
export default ThemeProvider;