import React, { useRef, useCallback } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export type ButtonVariant = "primary" | "secondary" | "outline";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityHint?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  testID,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  // Animation values for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: iconPosition === "right" ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      minHeight: 48,
    };

    if (isDisabled) {
      return {
        ...baseStyle,
        backgroundColor:
          variant === "outline" ? "transparent" : theme.colors.disabled,
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor: theme.colors.disabled,
        opacity: 0.6,
      };
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primaryLight,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = (): string => {
    if (isDisabled) {
      return variant === "outline"
        ? theme.colors.disabled
        : theme.colors.textInverse;
    }

    switch (variant) {
      case "primary":
        return theme.colors.textInverse;
      case "secondary":
        return theme.colors.primary;
      case "outline":
        return theme.colors.primary;
      default:
        return theme.colors.textInverse;
    }
  };

  const textColor = getTextColor();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={loading ? `${title}, loading` : title}
      accessibilityHint={accessibilityHint}
    >
      <Animated.View
        style={[
          getButtonStyles(),
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={textColor}
                style={
                  iconPosition === "left" ? styles.iconLeft : styles.iconRight
                }
              />
            )}
            <Text
              style={[
                styles.text,
                theme.typography.button,
                { color: textColor },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
