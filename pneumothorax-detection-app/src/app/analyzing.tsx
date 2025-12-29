/**
 * Analyzing Screen
 * Displays loading state during image analysis
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Easing,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAnalysis } from "../context/AnalysisContext";
import { analyzeImage } from "../services/pneumoDetection";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function AnalyzingScreen() {
  const { theme } = useTheme();
  const { addToHistory } = useAnalysis();
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri: string }>();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Start pulse animation for the overlay
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    // Start analysis
    performAnalysis();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const performAnalysis = async () => {
    if (!params.imageUri) {
      router.back();
      return;
    }

    try {
      // Call pneumothorax detection API
      const { result, apiResponse } = await analyzeImage(params.imageUri);

      // Save to history (Requirement 7.6)
      await addToHistory(result, apiResponse);

      // Navigate to results on completion (Requirement 4.5)
      router.replace({
        pathname: "/result",
        params: {
          imageUri: params.imageUri,
          results: JSON.stringify(result),
          apiResponse: JSON.stringify(apiResponse),
        },
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      // Navigate back on error
      router.back();
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="analyzing-screen"
      accessibilityLabel="Analyzing image screen"
      accessibilityRole="progressbar"
    >
      {/* Background/thumbnail of uploaded image (Requirement 4.3) */}
      {params.imageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: params.imageUri }}
            style={styles.backgroundImage}
            resizeMode="cover"
            blurRadius={3}
            testID="background-image"
            accessibilityLabel="Background preview of image being analyzed"
          />
          {/* Dark overlay for better contrast */}
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: theme.dark
                  ? "rgba(0, 0, 0, 0.7)"
                  : "rgba(0, 0, 0, 0.5)",
                opacity: pulseAnim,
              },
            ]}
          />
        </View>
      )}

      {/* Loading content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Animated loading spinner (Requirement 4.1) */}
        <LoadingSpinner
          size="large"
          color={theme.colors.primary}
          testID="loading-spinner"
        />

        {/* "Analyzing image..." text (Requirement 4.2) */}
        <Text
          style={[styles.title, { color: "#FFFFFF" }]}
          testID="analyzing-text"
          accessibilityLabel="Analyzing image"
          accessibilityRole="text"
        >
          Analyzing image...
        </Text>

        <Text
          style={[styles.subtitle, { color: "rgba(255, 255, 255, 0.8)" }]}
          accessibilityLabel="Please wait while we process your image"
        >
          Please wait while we process your image
        </Text>

        {/* Progress dots animation */}
        <View
          style={styles.dotsContainer}
          accessibilityLabel="Loading indicator"
        >
          <AnimatedDots />
        </View>
      </Animated.View>
    </View>
  );
}

/**
 * Animated dots component for visual feedback
 */
function AnimatedDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 200);
    const anim3 = animateDot(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: screenWidth,
    height: screenHeight,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  dotsContainer: {
    marginTop: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
});
