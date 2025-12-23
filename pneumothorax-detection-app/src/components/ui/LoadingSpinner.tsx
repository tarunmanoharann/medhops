import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Text,
  ViewStyle,
  Easing,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

export interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  message?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const SIZES = {
  small: 24,
  medium: 40,
  large: 60,
};

export default function LoadingSpinner({
  size = "medium",
  color,
  message,
  style,
  testID,
  accessibilityLabel = "Loading",
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const spinnerSize = SIZES[size];
  const spinnerColor = color || theme.colors.primary;
  const borderWidth = size === "small" ? 2 : size === "medium" ? 3 : 4;

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={message || accessibilityLabel}
      accessibilityRole="progressbar"
    >
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderWidth,
            borderColor: theme.colors.border,
            borderTopColor: spinnerColor,
            borderRadius: spinnerSize / 2,
            transform: [{ rotate: spin }],
          },
        ]}
      />
      {message && (
        <Text
          style={[
            theme.typography.body,
            styles.message,
            { color: theme.colors.textSecondary },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    borderStyle: "solid",
  },
  message: {
    marginTop: 16,
    textAlign: "center",
  },
});
