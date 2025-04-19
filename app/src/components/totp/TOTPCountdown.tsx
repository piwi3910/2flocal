import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useAnimation } from '../../context/AnimationContext';

interface TOTPCountdownProps {
  timeRemaining: number;
  totalTime: number;
  style?: ViewStyle;
  height?: number;
  pulseWhenLow?: boolean;
}

export const TOTPCountdown: React.FC<TOTPCountdownProps> = ({
  timeRemaining,
  totalTime,
  style,
  height = 4,
  pulseWhenLow = true,
}) => {
  const { theme } = useAppTheme();
  const {
    animationsEnabled,
    useAlternativeVisualCues,
    getAdjustedDuration
  } = useAnimation();
  
  const progress = useSharedValue(timeRemaining / totalTime);
  const scale = useSharedValue(1);

  // Update progress when timeRemaining changes
  useEffect(() => {
    // Always update the progress value for correct display
    if (animationsEnabled) {
      // Animate with timing if animations are enabled
      progress.value = withTiming(timeRemaining / totalTime, {
        duration: getAdjustedDuration(500),
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      // Immediately set the value without animation if animations are disabled
      progress.value = timeRemaining / totalTime;
    }

    // Add pulse animation when time is running low (less than 25%)
    if (animationsEnabled && pulseWhenLow && timeRemaining / totalTime < 0.25) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: getAdjustedDuration(300) }),
          withTiming(1, { duration: getAdjustedDuration(300) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      // Set scale to 1 without animation if animations are disabled
      scale.value = animationsEnabled
        ? withTiming(1, { duration: getAdjustedDuration(300) })
        : 1;
    }

    return () => {
      // Cleanup animation
      progress.value = 0;
      scale.value = 1;
    };
  }, [timeRemaining, totalTime, progress, scale, pulseWhenLow, animationsEnabled, getAdjustedDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
      backgroundColor: progress.value > 0.5
        ? theme.colors.primary
        : progress.value > 0.25
          ? theme.colors.warning
          : theme.colors.error,
      transform: [{ scaleY: scale.value }],
    };
  });

  const containerStyles = [
    styles.container,
    { height, backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
    style,
  ];

  // If animations are disabled and alternative visual cues are enabled,
  // add a more prominent visual indicator for low time
  if (!animationsEnabled && useAlternativeVisualCues && timeRemaining / totalTime < 0.25) {
    return (
      <View style={containerStyles}>
        <Animated.View
          style={[
            styles.progressBar,
            animatedStyle,
            styles.alternativeVisualCue
          ]}
        />
      </View>
    );
  }

  return (
    <View style={containerStyles}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
  },
  alternativeVisualCue: {
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.5)',
    borderStyle: 'dashed',
  },
});