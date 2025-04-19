import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'contained';

interface CardProps {
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle
   */
  subtitle?: string;
  
  /**
   * Card content as a string (for simple cards)
   */
  content?: string;
  
  /**
   * Card content as React elements (for complex cards)
   */
  children?: React.ReactNode;
  
  /**
   * Function to call when card is pressed
   */
  onPress?: () => void;
  
  /**
   * Card variant
   * @default 'default'
   */
  variant?: CardVariant;
  
  /**
   * Additional styles for the card
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Left icon or component to display in the card header
   */
  left?: React.ReactNode | ((props: { size: number }) => React.ReactNode);
  
  /**
   * Right icon or component to display in the card header
   */
  right?: React.ReactNode | ((props: { size: number }) => React.ReactNode);
  
  /**
   * Whether to show a divider between the header and content
   * @default false
   */
  withDivider?: boolean;
}

/**
 * A customized card component based on React Native Paper's Card
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  content,
  children,
  onPress,
  variant = 'default',
  style,
  testID,
  left,
  right,
  withDivider = false,
}) => {
  const { theme } = useAppTheme();
  
  // Determine card mode based on variant
  const getCardStyle = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'elevated':
        return [styles.card, { elevation: 2 }];
      case 'outlined':
        return [
          styles.card, 
          { 
            borderWidth: 1, 
            borderColor: theme.colors.outline,
            backgroundColor: 'transparent',
          }
        ];
      case 'contained':
        return [
          styles.card, 
          { backgroundColor: theme.colors.surfaceVariant }
        ];
      case 'default':
      default:
        return [styles.card];
    }
  };
  
  // Render card content
  const renderContent = () => {
    if (content) {
      return <PaperCard.Content><Text variant="bodyMedium">{content}</Text></PaperCard.Content>;
    }
    
    if (children) {
      return <PaperCard.Content>{children}</PaperCard.Content>;
    }
    
    return null;
  };
  
  return (
    <PaperCard
      style={[getCardStyle(), style]}
      onPress={onPress}
      testID={testID}
      mode={variant === 'outlined' ? 'outlined' : 'elevated'}
    >
      {(title || subtitle) && (
        <PaperCard.Title
          title={title}
          subtitle={subtitle}
          left={typeof left === 'function' ? left : left ? () => left : undefined}
          right={typeof right === 'function' ? right : right ? () => right : undefined}
        />
      )}
      
      {withDivider && (title || subtitle) && <PaperCard.Content><View style={styles.divider} /></PaperCard.Content>}
      
      {renderContent()}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginVertical: 8,
  },
});

export default Card;