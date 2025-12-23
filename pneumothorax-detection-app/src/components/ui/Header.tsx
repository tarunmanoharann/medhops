import React, { ReactNode, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StatusBar,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  rightComponent?: ReactNode;
  style?: ViewStyle;
  testID?: string;
  leftAccessibilityLabel?: string;
  rightAccessibilityLabel?: string;
}

function AnimatedIconButton({
  icon,
  onPress,
  color,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color: string;
  accessibilityLabel?: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || "Button"}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View
        style={[styles.iconButton, { transform: [{ scale: scaleAnim }] }]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </Animated.View>
    </Pressable>
  );
}

export default function Header({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  rightComponent,
  style,
  testID,
  leftAccessibilityLabel = "Go back",
  rightAccessibilityLabel = "Action",
}: HeaderProps) {
  const { theme } = useTheme();

  const headerStyle: ViewStyle = {
    backgroundColor: theme.colors.surface,
    paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  return (
    <View
      style={[headerStyle, style]}
      testID={testID}
      accessibilityRole="header"
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftIcon && onLeftPress && (
            <AnimatedIconButton
              icon={leftIcon}
              onPress={onLeftPress}
              color={theme.colors.text}
              accessibilityLabel={leftAccessibilityLabel}
            />
          )}
        </View>

        <View style={styles.centerSection}>
          <Text
            style={[
              theme.typography.h3,
              { color: theme.colors.text, textAlign: "center" },
            ]}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textSecondary, textAlign: "center" },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightComponent
            ? rightComponent
            : rightIcon &&
              onRightPress && (
                <AnimatedIconButton
                  icon={rightIcon}
                  onPress={onRightPress}
                  color={theme.colors.text}
                  accessibilityLabel={rightAccessibilityLabel}
                />
              )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  leftSection: {
    width: 44,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 1,
    alignItems: "center",
  },
  rightSection: {
    width: 44,
    alignItems: "flex-end",
  },
  iconButton: {
    padding: 8,
    marginLeft: -8,
  },
});
