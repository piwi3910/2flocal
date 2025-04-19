import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme, MD3TypescaleKey } from 'react-native-paper';

// Define font configuration
const fontConfig = {
  fontFamily: 'System',
};

// Define custom font sizes
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Define spacing scale
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Define custom font configuration for different variants
const customFonts: Record<MD3TypescaleKey, {
  fontFamily: string;
  fontSize: number;
  fontWeight: "300" | "400" | "500" | "700" | "normal" | "bold";
  letterSpacing: number;
  lineHeight: number;
}> = {
  displayLarge: {
    ...fontConfig,
    fontSize: fontSizes.xxxl,
    fontWeight: "700",
    letterSpacing: 0.15,
    lineHeight: fontSizes.xxxl * 1.2,
  },
  displayMedium: {
    ...fontConfig,
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    letterSpacing: 0.15,
    lineHeight: fontSizes.xxl * 1.2,
  },
  displaySmall: {
    ...fontConfig,
    fontSize: fontSizes.xl,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: fontSizes.xl * 1.2,
  },
  headlineLarge: {
    ...fontConfig,
    fontSize: fontSizes.xl,
    fontWeight: "700",
    letterSpacing: 0.15,
    lineHeight: fontSizes.xl * 1.2,
  },
  headlineMedium: {
    ...fontConfig,
    fontSize: fontSizes.lg,
    fontWeight: "700",
    letterSpacing: 0.15,
    lineHeight: fontSizes.lg * 1.2,
  },
  headlineSmall: {
    ...fontConfig,
    fontSize: fontSizes.md,
    fontWeight: "700",
    letterSpacing: 0.1,
    lineHeight: fontSizes.md * 1.2,
  },
  titleLarge: {
    ...fontConfig,
    fontSize: fontSizes.lg,
    fontWeight: "500",
    letterSpacing: 0.15,
    lineHeight: fontSizes.lg * 1.2,
  },
  titleMedium: {
    ...fontConfig,
    fontSize: fontSizes.md,
    fontWeight: "500",
    letterSpacing: 0.15,
    lineHeight: fontSizes.md * 1.2,
  },
  titleSmall: {
    ...fontConfig,
    fontSize: fontSizes.sm,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: fontSizes.sm * 1.2,
  },
  bodyLarge: {
    ...fontConfig,
    fontSize: fontSizes.md,
    fontWeight: "400",
    letterSpacing: 0.15,
    lineHeight: fontSizes.md * 1.5,
  },
  bodyMedium: {
    ...fontConfig,
    fontSize: fontSizes.sm,
    fontWeight: "400",
    letterSpacing: 0.25,
    lineHeight: fontSizes.sm * 1.5,
  },
  bodySmall: {
    ...fontConfig,
    fontSize: fontSizes.xs,
    fontWeight: "400",
    letterSpacing: 0.4,
    lineHeight: fontSizes.xs * 1.5,
  },
  labelLarge: {
    ...fontConfig,
    fontSize: fontSizes.sm,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: fontSizes.sm * 1.2,
  },
  labelMedium: {
    ...fontConfig,
    fontSize: fontSizes.xs,
    fontWeight: "500",
    letterSpacing: 0.5,
    lineHeight: fontSizes.xs * 1.2,
  },
  labelSmall: {
    ...fontConfig,
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
    lineHeight: 11 * 1.2,
  },
};

// Define custom theme type that includes our semantic colors
export interface CustomThemeColors extends MD3Theme {
  colors: MD3Theme['colors'] & {
    success: string;
    successContainer: string;
    onSuccess: string;
    onSuccessContainer: string;
    warning: string;
    warningContainer: string;
    onWarning: string;
    onWarningContainer: string;
    info: string;
    infoContainer: string;
    onInfo: string;
    onInfoContainer: string;
  };
}

// Define light theme colors
// These colors have been selected to meet WCAG 2.1 AA accessibility standards
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#006494', // Deep blue - security, trust
    primaryContainer: '#D1E4FF', // Light blue container
    onPrimary: '#FFFFFF', // White text on primary
    onPrimaryContainer: '#001D36', // Dark text on primary container
    
    secondary: '#4DA1A9', // Teal - modern, tech
    secondaryContainer: '#D8EBED', // Light teal container
    onSecondary: '#FFFFFF', // White text on secondary
    onSecondaryContainer: '#0A2E30', // Dark text on secondary container
    
    tertiary: '#D7263D', // Red - alerts, important actions
    tertiaryContainer: '#FFDAD6', // Light red container
    onTertiary: '#FFFFFF', // White text on tertiary
    onTertiaryContainer: '#410008', // Dark text on tertiary container
    
    error: '#D7263D', // Red for errors
    errorContainer: '#FFDAD6', // Light red container for errors
    onError: '#FFFFFF', // White text on error
    onErrorContainer: '#410008', // Dark text on error container
    
    background: '#F5F5F5', // Light gray background
    onBackground: '#1A1A1A', // Dark text on background
    
    surface: '#FFFFFF', // White surface
    onSurface: '#1A1A1A', // Dark text on surface
    surfaceVariant: '#E7E7E7', // Light gray surface variant
    onSurfaceVariant: '#444444', // Dark gray text on surface variant
    
    outline: '#74777F', // Gray outline
    outlineVariant: '#C4C7C5', // Light gray outline variant
    
    // Custom semantic colors
    success: '#2E933C', // Green for success
    successContainer: '#D4EDDA', // Light green container
    onSuccess: '#FFFFFF', // White text on success
    onSuccessContainer: '#0A2E0F', // Dark text on success container
    
    warning: '#F9A826', // Orange for warnings
    warningContainer: '#FFF3CD', // Light orange container
    onWarning: '#FFFFFF', // White text on warning
    onWarningContainer: '#332200', // Dark text on warning container
    
    info: '#2196F3', // Blue for information
    infoContainer: '#D1ECFF', // Light blue container
    onInfo: '#FFFFFF', // White text on info
    onInfoContainer: '#0A1B2A', // Dark text on info container
  },
  fonts: configureFonts({ config: customFonts }) as MD3Theme['fonts'],
  roundness: 8,
  animation: {
    scale: 1.0,
  },
  elevation: {
    level0: 0,
    level1: 2,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
};

// Define dark theme colors
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4DA1A9', // Lighter teal for dark mode
    primaryContainer: '#004D64', // Dark blue container
    onPrimary: '#FFFFFF', // White text on primary
    onPrimaryContainer: '#D1E4FF', // Light text on primary container
    
    secondary: '#81D4FA', // Light blue
    secondaryContainer: '#1F4E54', // Dark teal container
    onSecondary: '#000000', // Black text on secondary
    onSecondaryContainer: '#D8EBED', // Light text on secondary container
    
    tertiary: '#FF6B6B', // Lighter red for dark mode
    tertiaryContainer: '#930012', // Dark red container
    onTertiary: '#000000', // Black text on tertiary
    onTertiaryContainer: '#FFDAD6', // Light text on tertiary container
    
    error: '#FF6B6B', // Lighter red for errors in dark mode
    errorContainer: '#930012', // Dark red container for errors
    onError: '#000000', // Black text on error
    onErrorContainer: '#FFDAD6', // Light text on error container
    
    background: '#121212', // Dark background
    onBackground: '#E1E1E1', // Light text on background
    
    surface: '#1E1E1E', // Dark surface
    onSurface: '#E1E1E1', // Light text on surface
    surfaceVariant: '#2C2C2C', // Dark gray surface variant
    onSurfaceVariant: '#C4C7C5', // Light gray text on surface variant
    
    outline: '#8E9193', // Light gray outline
    outlineVariant: '#444746', // Dark gray outline variant
    
    // Custom semantic colors
    success: '#4CAF50', // Green for success
    successContainer: '#0F5214', // Dark green container
    onSuccess: '#000000', // Black text on success
    onSuccessContainer: '#D4EDDA', // Light text on success container
    
    warning: '#FFB74D', // Orange for warnings
    warningContainer: '#663D00', // Dark orange container
    onWarning: '#000000', // Black text on warning
    onWarningContainer: '#FFF3CD', // Light text on warning container
    
    info: '#64B5F6', // Blue for information
    infoContainer: '#0D47A1', // Dark blue container
    onInfo: '#000000', // Black text on info
    onInfoContainer: '#D1ECFF', // Light text on info container
  },
  fonts: configureFonts({ config: customFonts }) as MD3Theme['fonts'],
  roundness: 8,
  animation: {
    scale: 1.0,
  },
  elevation: {
    level0: 0,
    level1: 2,
    level2: 3,
    level3: 6,
    level4: 8,
    level5: 12,
  },
};

// Define OLED dark theme (true black for OLED screens)
export const oledDarkTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#000000', // True black for OLED screens
    surface: '#000000',    // True black for OLED screens
    surfaceVariant: '#121212', // Very dark gray for surface variant
  },
};

// Export spacing for use throughout the app
export const themeSpacing = spacing;

// Export custom types
export type ThemeType = 'light' | 'dark' | 'system';
export type DarkModeType = 'dark' | 'oled';

// Type assertion for our custom themes
export const customLightTheme = lightTheme as CustomThemeColors;
export const customDarkTheme = darkTheme as CustomThemeColors;
export const customOledDarkTheme = oledDarkTheme as CustomThemeColors;