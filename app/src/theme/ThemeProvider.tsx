import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { customLightTheme, customDarkTheme, ThemeType, CustomThemeColors } from './theme';

interface ThemeContextType {
  theme: CustomThemeColors;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the theme context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: customLightTheme,
  themeType: 'system',
  setThemeType: () => {},
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
  
  // Determine if dark mode is active based on theme type and system preference
  const isDarkMode = 
    themeType === 'dark' || (themeType === 'system' && colorScheme === 'dark');
  
  // Set the theme based on dark mode status
  const theme = isDarkMode ? customDarkTheme : customLightTheme;
  
  // Function to toggle between light and dark themes
  const toggleTheme = () => {
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
        setThemeType, 
        isDarkMode,
        toggleTheme
      }}
    >
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Export default ThemeProvider
export default ThemeProvider;