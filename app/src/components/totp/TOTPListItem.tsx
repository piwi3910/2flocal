import React, { useEffect } from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface TOTPListItemProps {
  index: number;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  isRemoving?: boolean;
  onRemoveAnimationComplete?: () => void;
}

export const TOTPListItem: React.FC<TOTPListItemProps> = ({
  index,
  onPress,
  children,
  style,
  isRemoving = false,
  onRemoveAnimationComplete,
}) => {
  const translateX = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  // Initial mount animation
  useEffect(() => {
    const delay = index * 100; // Stagger the animations based on index
    
    translateX.value = withDelay(
      delay,
      withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
    
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [index, translateX, opacity]);

  // Removal animation
  useEffect(() => {
    if (isRemoving) {
      // Define the animation completion handler inside useEffect
      const handleRemoveAnimationComplete = () => {
        if (onRemoveAnimationComplete) {
          onRemoveAnimationComplete();
        }
      };

      // Animate out when removing
      scale.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(0, { 
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, () => {
          if (onRemoveAnimationComplete) {
            handleRemoveAnimationComplete();
          }
          return true;
        })
      );
      
      opacity.value = withTiming(0, { 
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      translateX.value = withTiming(-100, { 
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [isRemoving, scale, opacity, translateX, onRemoveAnimationComplete]);

  // Pressable animation
  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View style={[styles.container, animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  container: {
    width: '100%',
    marginVertical: 4,
  },
});