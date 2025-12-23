import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, AccessibilityRole } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: "default" | "elevated";
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

export default function Card({
  children,
  style,
  variant = "default",
  testID,
  accessibilityLabel,
  accessibilityRole,
}: CardProps) {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...(variant === "elevated"
      ? {
          shadowColor: theme.dark ? "#000" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.dark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
      : {
          borderWidth: 1,
          borderColor: theme.colors.border,
        }),
  };

  return (
    <View
      style={[cardStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
}
