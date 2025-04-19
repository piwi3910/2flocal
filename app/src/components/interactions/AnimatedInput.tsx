import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  Text,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';

export interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface AnimatedInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

export const AnimatedInput = forwardRef<AnimatedInputRef, AnimatedInputProps>(
  (
    {
      label,
      error,
      containerStyle,
      labelStyle,
      inputStyle,
      errorStyle,
      leftIcon,
      rightIcon,
      onFocus,
      onBlur,
      value,
      ...rest
    },
    ref
  ) => {
    const { theme } = useAppTheme();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const hasValue = value !== undefined && value !== '';

    // Animation values
    const labelTranslateY = useSharedValue(hasValue || isFocused ? -25 : 0);
    const labelScale = useSharedValue(hasValue || isFocused ? 0.85 : 1);
    const borderWidth = useSharedValue(isFocused ? 2 : 1);
    const focusAnimation = useSharedValue(isFocused ? 1 : 0);

    // Forward ref methods
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      clear: () => {
        inputRef.current?.clear();
      },
      isFocused: () => {
        return inputRef.current?.isFocused() || false;
      },
    }));

    // Handle focus event
    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      animateToFocused();
      if (onFocus) {
        onFocus(e);
      }
    };

    // Handle blur event
    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      if (!hasValue) {
        animateToBlurred();
      }
      if (onBlur) {
        onBlur(e);
      }
    };

    // Animate to focused state
    const animateToFocused = () => {
      labelTranslateY.value = withTiming(-25, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      labelScale.value = withTiming(0.85, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      borderWidth.value = withTiming(2, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      focusAnimation.value = withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    };

    // Animate to blurred state
    const animateToBlurred = () => {
      labelTranslateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      labelScale.value = withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      borderWidth.value = withTiming(1, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      focusAnimation.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    };

    // Animated styles
    const labelAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateY: labelTranslateY.value },
          { scale: labelScale.value },
        ],
        color: error
          ? theme.colors.error
          : interpolateColor(
              focusAnimation.value,
              [0, 1],
              [theme.colors.onBackground, theme.colors.primary]
            ),
      };
    });

    const containerAnimatedStyle = useAnimatedStyle(() => {
      return {
        borderWidth: borderWidth.value,
        borderColor: error
          ? theme.colors.error
          : interpolateColor(
              focusAnimation.value,
              [0, 1],
              [theme.colors.outline, theme.colors.primary]
            ),
      };
    });

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.dark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
            },
            containerAnimatedStyle,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <View style={styles.inputContainer}>
            {label && (
              <Animated.Text style={[styles.label, labelAnimatedStyle, labelStyle]}>
                {label}
              </Animated.Text>
            )}

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: theme.colors.onBackground,
                },
                inputStyle,
              ]}
              placeholderTextColor={theme.colors.onBackground + '80'}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={value}
              {...rest}
            />
          </View>

          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </Animated.View>

        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }, errorStyle]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 56,
    overflow: 'hidden',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  label: {
    position: 'absolute',
    left: 0,
    fontSize: 16,
    fontWeight: '400',
  },
  leftIcon: {
    paddingHorizontal: 12,
  },
  rightIcon: {
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});