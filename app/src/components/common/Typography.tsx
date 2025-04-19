import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';

export type TypographyVariant = 
  | 'displayLarge' 
  | 'displayMedium' 
  | 'displaySmall' 
  | 'headlineLarge' 
  | 'headlineMedium' 
  | 'headlineSmall' 
  | 'titleLarge' 
  | 'titleMedium' 
  | 'titleSmall' 
  | 'bodyLarge' 
  | 'bodyMedium' 
  | 'bodySmall' 
  | 'labelLarge' 
  | 'labelMedium' 
  | 'labelSmall';

interface TypographyProps {
  /**
   * Text content
   */
  children: React.ReactNode;
  
  /**
   * Typography variant
   * @default 'bodyMedium'
   */
  variant?: TypographyVariant;
  
  /**
   * Text color
   */
  color?: string;
  
  /**
   * Whether the text is centered
   * @default false
   */
  center?: boolean;
  
  /**
   * Whether the text is right-aligned
   * @default false
   */
  right?: boolean;
  
  /**
   * Whether the text is bold
   * @default false
   */
  bold?: boolean;
  
  /**
   * Whether the text is italic
   * @default false
   */
  italic?: boolean;
  
  /**
   * Number of lines before truncating
   */
  numberOfLines?: number;
  
  /**
   * Additional styles for the text
   */
  style?: StyleProp<TextStyle>;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A typography component for consistent text styling
 */
export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'bodyMedium',
  color,
  center = false,
  right = false,
  bold = false,
  italic = false,
  numberOfLines,
  style,
  testID,
}) => {
  const { theme } = useAppTheme();
  
  // Determine text alignment
  const getTextAlign = (): 'auto' | 'left' | 'right' | 'center' | 'justify' => {
    if (center) return 'center';
    if (right) return 'right';
    return 'left';
  };
  
  // Determine font weight
  const getFontWeight = (): TextStyle['fontWeight'] => {
    if (bold) return 'bold';
    return 'normal';
  };
  
  // Determine font style
  const getFontStyle = (): TextStyle['fontStyle'] => {
    if (italic) return 'italic';
    return 'normal';
  };
  
  // Combine styles
  const combinedStyles: StyleProp<TextStyle> = [
    {
      color: color || theme.colors.onSurface,
      textAlign: getTextAlign(),
      fontWeight: getFontWeight(),
      fontStyle: getFontStyle(),
    },
    style,
  ];
  
  return (
    <Text
      variant={variant}
      style={combinedStyles}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
};

// Convenience components for common typography variants
export const DisplayLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="displayLarge" {...props} />
);

export const DisplayMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="displayMedium" {...props} />
);

export const DisplaySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="displaySmall" {...props} />
);

export const HeadlineLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="headlineLarge" {...props} />
);

export const HeadlineMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="headlineMedium" {...props} />
);

export const HeadlineSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="headlineSmall" {...props} />
);

export const TitleLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="titleLarge" {...props} />
);

export const TitleMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="titleMedium" {...props} />
);

export const TitleSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="titleSmall" {...props} />
);

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="bodyLarge" {...props} />
);

export const BodyMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="bodyMedium" {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="bodySmall" {...props} />
);

export const LabelLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="labelLarge" {...props} />
);

export const LabelMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="labelMedium" {...props} />
);

export const LabelSmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="labelSmall" {...props} />
);

export default Typography;