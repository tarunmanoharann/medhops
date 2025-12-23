/**
 * HistoryCard component - Individual history list item
 * Requirements: 7.2, 7.3, 7.4
 */

import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { HistoryCardProps } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THUMBNAIL_SIZE = 80;

export default function HistoryCard({
  id,
  thumbnailUri,
  date,
  detectionsCount,
  onPress,
  onDelete,
}: HistoryCardProps) {
  const { theme } = useTheme();

  // Animation values for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  // Format date for display
  const formatDate = (d: Date): string => {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate accessibility label
  const accessibilityLabel = `Analysis from ${formatDate(date)}. ${
    detectionsCount > 0
      ? `${detectionsCount} detection${detectionsCount !== 1 ? "s" : ""} found`
      : "No pneumothorax detected"
  }. Swipe left to delete.`;

  // Render right swipe action (delete)
  const renderRightActions = () => {
    return (
      <Pressable
        style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Delete analysis from ${formatDate(date)}`}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to view full analysis results"
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Thumbnail */}
          <View
            style={[
              styles.thumbnailContainer,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.date, { color: theme.colors.text }]}>
              {formatDate(date)}
            </Text>

            <View style={styles.detectionRow}>
              {detectionsCount > 0 ? (
                <>
                  <Ionicons
                    name="warning"
                    size={16}
                    color={theme.colors.warning}
                  />
                  <Text
                    style={[
                      styles.detectionText,
                      { color: theme.colors.warning },
                    ]}
                  >
                    {detectionsCount} detection
                    {detectionsCount !== 1 ? "s" : ""} found
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.success}
                  />
                  <Text
                    style={[
                      styles.detectionText,
                      { color: theme.colors.success },
                    ]}
                  >
                    No pneumothorax detected
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Chevron */}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </Animated.View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  date: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detectionText: {
    fontSize: 14,
    marginLeft: 6,
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginVertical: 6,
    marginRight: 16,
    borderRadius: 12,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
});
