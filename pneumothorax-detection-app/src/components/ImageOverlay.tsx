/**
 * ImageOverlay Component
 * Renders bounding boxes on detected pneumothorax regions
 * Requirements: 5.2, 5.3, 5.4
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
  Modal,
  Animated,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { BoundingBox, ImageOverlayProps } from "../types";

interface TooltipState {
  visible: boolean;
  box: BoundingBox | null;
  position: { x: number; y: number };
}

function AnimatedBoundingBox({
  box,
  imageSize,
  theme,
  showLabels,
  onPress,
}: {
  box: BoundingBox;
  imageSize: { width: number; height: number };
  theme: any;
  showLabels: boolean;
  onPress: (box: BoundingBox, event: any) => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
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

  // Convert percentage coordinates to pixel positions
  const left = (box.x / 100) * imageSize.width;
  const top = (box.y / 100) * imageSize.height;
  const width = (box.width / 100) * imageSize.width;
  const height = (box.height / 100) * imageSize.height;

  return (
    <Pressable
      key={box.id}
      onPress={(event) => onPress(box, event)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Detection ${box.id}, confidence ${Math.round(box.confidence * 100)}%`}
      accessibilityHint="Double tap to view details"
    >
      <Animated.View
        style={[
          styles.boundingBox,
          {
            position: "absolute",
            left,
            top,
            width,
            height,
            borderColor: theme.colors.detection,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {showLabels && (
          <View
            style={[styles.label, { backgroundColor: theme.colors.detection }]}
          >
            <Text style={styles.labelText}>{box.id}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function ImageOverlay({
  imageUri,
  boundingBoxes,
  onBoxPress,
  showLabels = true,
}: ImageOverlayProps) {
  const { theme } = useTheme();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    box: null,
    position: { x: 0, y: 0 },
  });

  const handleImageLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setImageSize({ width, height });
  };

  const handleBoxPress = (box: BoundingBox, event: any) => {
    const { pageX, pageY } = event.nativeEvent;

    setTooltip({
      visible: true,
      box,
      position: { x: pageX, y: pageY },
    });

    if (onBoxPress) {
      onBoxPress(box);
    }
  };

  const closeTooltip = () => {
    setTooltip({ visible: false, box: null, position: { x: 0, y: 0 } });
  };

  const formatConfidence = (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Image with ${boundingBoxes.length} detection${boundingBoxes.length !== 1 ? "s" : ""}`}
    >
      <View style={styles.imageContainer} onLayout={handleImageLayout}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Analyzed medical image"
        />
        {imageSize.width > 0 &&
          boundingBoxes.map((box) => (
            <AnimatedBoundingBox
              key={box.id}
              box={box}
              imageSize={imageSize}
              theme={theme}
              showLabels={showLabels}
              onPress={handleBoxPress}
            />
          ))}
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={tooltip.visible}
        transparent
        animationType="fade"
        onRequestClose={closeTooltip}
      >
        <Pressable
          style={styles.tooltipOverlay}
          onPress={closeTooltip}
          accessibilityLabel="Close tooltip"
          accessibilityRole="button"
        >
          {tooltip.box && (
            <View
              style={[
                styles.tooltip,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  top: Math.min(
                    tooltip.position.y - 80,
                    Dimensions.get("window").height - 120,
                  ),
                  left: Math.min(
                    Math.max(tooltip.position.x - 75, 16),
                    Dimensions.get("window").width - 166,
                  ),
                },
              ]}
              accessibilityLabel={`Detection ${tooltip.box.id} details. Confidence: ${formatConfidence(tooltip.box.confidence)}. Position: ${Math.round(tooltip.box.x)}%, ${Math.round(tooltip.box.y)}%`}
            >
              <Text style={[styles.tooltipTitle, { color: theme.colors.text }]}>
                Detection #{tooltip.box.id}
              </Text>
              <View style={styles.tooltipRow}>
                <Text
                  style={[
                    styles.tooltipLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Confidence:
                </Text>
                <Text
                  style={[
                    styles.tooltipValue,
                    { color: theme.colors.detection },
                  ]}
                >
                  {formatConfidence(tooltip.box.confidence)}
                </Text>
              </View>
              <View style={styles.tooltipRow}>
                <Text
                  style={[
                    styles.tooltipLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Position:
                </Text>
                <Text
                  style={[styles.tooltipValue, { color: theme.colors.text }]}
                >
                  ({Math.round(tooltip.box.x)}%, {Math.round(tooltip.box.y)}%)
                </Text>
              </View>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  boundingBox: {
    position: "absolute",
    borderWidth: 2,
    borderStyle: "solid",
  },
  label: {
    position: "absolute",
    top: -20,
    left: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 20,
    alignItems: "center",
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  tooltip: {
    position: "absolute",
    width: 150,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tooltipRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tooltipLabel: {
    fontSize: 12,
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: "600",
  },
});
