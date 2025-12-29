import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { AlignmentGuideProps } from "../types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GUIDE_WIDTH = SCREEN_WIDTH * 0.85;
const GUIDE_HEIGHT = GUIDE_WIDTH * 1.2; // Aspect ratio for X-ray images
const CORNER_SIZE = 30;
const CORNER_THICKNESS = 4;


export default function AlignmentGuide({ visible }: AlignmentGuideProps) {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top overlay */}
      <View style={[styles.overlay, styles.topOverlay]} />

      {/* Middle section with cutout */}
      <View style={styles.middleSection}>
        {/* Left overlay */}
        <View style={[styles.overlay, styles.sideOverlay]} />

        {/* Clear center area with corner markers */}
        <View style={styles.cutout}>
          {/* Top-left corner */}
          <View style={[styles.corner, styles.topLeft]}>
            <View style={[styles.cornerLine, styles.horizontalLine]} />
            <View style={[styles.cornerLine, styles.verticalLine]} />
          </View>

          {/* Top-right corner */}
          <View style={[styles.corner, styles.topRight]}>
            <View style={[styles.cornerLine, styles.horizontalLine]} />
            <View style={[styles.cornerLine, styles.verticalLine]} />
          </View>

          {/* Bottom-left corner */}
          <View style={[styles.corner, styles.bottomLeft]}>
            <View style={[styles.cornerLine, styles.horizontalLine]} />
            <View style={[styles.cornerLine, styles.verticalLine]} />
          </View>

          {/* Bottom-right corner */}
          <View style={[styles.corner, styles.bottomRight]}>
            <View style={[styles.cornerLine, styles.horizontalLine]} />
            <View style={[styles.cornerLine, styles.verticalLine]} />
          </View>
        </View>

        {/* Right overlay */}
        <View style={[styles.overlay, styles.sideOverlay]} />
      </View>

      {/* Bottom overlay */}
      <View style={[styles.overlay, styles.bottomOverlay]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  topOverlay: {
    width: "100%",
    height: (SCREEN_HEIGHT - GUIDE_HEIGHT) / 2,
  },
  bottomOverlay: {
    width: "100%",
    height: (SCREEN_HEIGHT - GUIDE_HEIGHT) / 2,
  },
  middleSection: {
    flexDirection: "row",
    height: GUIDE_HEIGHT,
  },
  sideOverlay: {
    width: (SCREEN_WIDTH - GUIDE_WIDTH) / 2,
    height: GUIDE_HEIGHT,
  },
  cutout: {
    width: GUIDE_WIDTH,
    height: GUIDE_HEIGHT,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  cornerLine: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
  },
  horizontalLine: {
    width: CORNER_SIZE,
    height: CORNER_THICKNESS,
  },
  verticalLine: {
    width: CORNER_THICKNESS,
    height: CORNER_SIZE,
  },
});
