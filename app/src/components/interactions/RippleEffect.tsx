import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';

interface RippleEffectProps {
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
  rippleColor?: string;
  rippleOpacity?: number;
  rippleDuration?: number;
  disabled?: boolean;
}

interface RipplePosition {
  locationX: number;
  locationY: number;
  width: number;
  height: number;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({
  onPress,
  style,
  children,
  rippleColor,
  rippleOpacity = 0.3,
  rippleDuration = 600,
  disabled = false,
}) => {
  const { theme } = useAppTheme();
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [ripples, setRipples] = useState<RipplePosition[]>([]);

  // Default ripple color based on theme
  const defaultRippleColor = theme.dark ? '#ffffff' : '#000000';
  const rippleColorValue = rippleColor || defaultRippleColor;

  // Handle layout changes to get component dimensions
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  // Create a new ripple at the touch position
  const createRipple = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Calculate ripple size (should be at least as large as the component)
    const size = Math.max(layout.width, layout.height) * 2;
    
    // Add new ripple
    const newRipple = {
      locationX,
      locationY,
      width: size,
      height: size,
    };
    
    setRipples([...ripples, newRipple]);
  };

  // Remove a ripple after animation completes
  const removeRipple = () => {
    if (ripples.length > 0) {
      const newRipples = [...ripples];
      newRipples.shift();
      setRipples(newRipples);
    }
  };

  // Handle press with ripple effect
  const handlePress = (event: any) => {
    if (!disabled) {
      createRipple(event);
      if (onPress) {
        onPress();
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.container, style]} onLayout={onLayout}>
        {children}
        
        {/* Render ripples */}
        {ripples.map((ripple, index) => (
          <RippleAnimation
            key={index}
            position={ripple}
            color={rippleColorValue}
            opacity={rippleOpacity}
            duration={rippleDuration}
            onAnimationEnd={removeRipple}
          />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

interface RippleAnimationProps {
  position: RipplePosition;
  color: string;
  opacity: number;
  duration: number;
  onAnimationEnd: () => void;
}

const RippleAnimation: React.FC<RippleAnimationProps> = ({
  position,
  color,
  opacity,
  duration,
  onAnimationEnd,
}) => {
  const rippleOpacity = useSharedValue(opacity);
  const rippleScale = useSharedValue(0);

  // Start animation when component mounts
  React.useEffect(() => {
    // Animate opacity and scale
    rippleScale.value = withTiming(1, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    rippleOpacity.value = withSequence(
      withTiming(opacity, { duration: duration * 0.3 }),
      withTiming(0, { 
        duration: duration * 0.7,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, () => {
        runOnJS(onAnimationEnd)();
        return true;
      })
    );
  }, [rippleOpacity, rippleScale, duration, opacity, onAnimationEnd]);

  // Animated styles for the ripple
  const animatedStyles = useAnimatedStyle(() => {
    return {
      opacity: rippleOpacity.value,
      transform: [{ scale: rippleScale.value }],
    };
  });

  // Position the ripple at the touch point
  const rippleStyles = {
    width: position.width,
    height: position.height,
    borderRadius: position.width / 2,
    backgroundColor: color,
    position: 'absolute' as 'absolute',
    top: position.locationY - position.height / 2,
    left: position.locationX - position.width / 2,
  };

  return <Animated.View style={[rippleStyles, animatedStyles]} />;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
});