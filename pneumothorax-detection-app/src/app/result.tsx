/**
 * Result Screen
 * Displays detection results with interactive overlays
 * Requirements: 5.1, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { useTheme } from "../context/ThemeContext";
import { Card, Button } from "../components/ui";
import ImageOverlay from "../components/ImageOverlay";
import { DetectionResult, BoundingBox } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ResultScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    imageUri: string;
    results: string;
  }>();

  // Parse results from params
  const results: DetectionResult | null = params.results
    ? JSON.parse(params.results)
    : null;
  const imageUri = params.imageUri || "";

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Calculate summary statistics
  const detectionsCount = results?.boundingBoxes?.length || 0;
  const averageConfidence = results?.averageConfidence || 0;
  const hasDetections = detectionsCount > 0;

  // Format timestamp
  const formatTimestamp = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle save to gallery
  const handleSave = async () => {
    setSaving(true);

    try {
      // Check if we have a valid local file
      if (!imageUri.startsWith("file://")) {
        Alert.alert(
          "Cannot Save",
          "Only locally captured images can be saved to gallery.",
        );
        setSaving(false);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync(false);

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to save images to your gallery.",
        );
        setSaving(false);
        return;
      }

      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert("Success", "Image saved to gallery successfully!");
    } catch (error: any) {
      console.error("Save error:", error);

      // Handle Expo Go limitation for media library
      if (
        error.message?.includes("AUDIO") ||
        error.message?.includes("AndroidManifest") ||
        error.message?.includes("permission")
      ) {
        Alert.alert(
          "Expo Go Limitation",
          "Saving to gallery requires a development build. Use the Share feature instead.",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert("Error", "Failed to save image. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      setSharing(true);

      const message = hasDetections
        ? `Pneumothorax Detection Analysis\n\nDetections: ${detectionsCount}\nAverage Confidence: ${Math.round(averageConfidence * 100)}%\n\nAnalyzed on: ${formatTimestamp(results?.timestamp || new Date())}`
        : `Pneumothorax Detection Analysis\n\nNo pneumothorax detected.\n\nAnalyzed on: ${formatTimestamp(results?.timestamp || new Date())}`;

      await Share.share({
        message,
        title: "Pneumothorax Analysis Results",
      });
    } catch (error) {
      console.error("Share error:", error);
    } finally {
      setSharing(false);
    }
  };

  // Handle new analysis
  const handleNewAnalysis = () => {
    router.replace("/(tabs)");
  };

  // Handle box press
  const handleBoxPress = (box: BoundingBox) => {
    console.log("Box pressed:", box.id);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Analysis results screen"
    >
      {/* Header */}
      <View style={styles.header} accessibilityRole="header">
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Analysis Results
        </Text>
        <Text
          style={[styles.timestamp, { color: theme.colors.textSecondary }]}
          accessibilityLabel={`Analyzed on ${formatTimestamp(results?.timestamp || new Date())}`}
        >
          {formatTimestamp(results?.timestamp || new Date())}
        </Text>
      </View>

      {/* Image with Overlays */}
      <View style={styles.imageSection}>
        <ScrollView
          horizontal
          maximumZoomScale={4}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.zoomContainer}
          accessibilityLabel="Analyzed image with detection overlays"
        >
          <View
            style={[
              styles.imageWrapper,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <ImageOverlay
              imageUri={imageUri}
              boundingBoxes={results?.boundingBoxes || []}
              onBoxPress={handleBoxPress}
              showLabels={true}
            />
          </View>
        </ScrollView>

        <Text style={[styles.zoomHint, { color: theme.colors.textSecondary }]}>
          Pinch to zoom • Tap detection boxes for details
        </Text>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard} variant="elevated">
        {hasDetections ? (
          <View
            accessibilityLabel={`Pneumothorax detected. ${detectionsCount} detection${detectionsCount !== 1 ? "s" : ""} with ${Math.round(averageConfidence * 100)}% average confidence`}
          >
            <View style={styles.summaryHeader}>
              <Ionicons name="warning" size={24} color={theme.colors.warning} />
              <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
                Pneumothorax Detected
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.detection }]}
                  accessibilityLabel={`${detectionsCount} detection${detectionsCount !== 1 ? "s" : ""}`}
                >
                  {detectionsCount}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Detection{detectionsCount !== 1 ? "s" : ""}
                </Text>
              </View>
              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <View style={styles.statItem}>
                <Text
                  style={[styles.statValue, { color: theme.colors.primary }]}
                  accessibilityLabel={`${Math.round(averageConfidence * 100)} percent average confidence`}
                >
                  {Math.round(averageConfidence * 100)}%
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Avg. Confidence
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={styles.noDetectionContainer}
            accessibilityLabel="No pneumothorax detected in this image"
          >
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={theme.colors.success}
            />
            <Text
              style={[styles.noDetectionText, { color: theme.colors.text }]}
            >
              No Pneumothorax Detected
            </Text>
            <Text
              style={[
                styles.noDetectionSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              The analysis did not identify any signs of pneumothorax in this
              image.
            </Text>
          </View>
        )}
      </Card>

      {/* Medical Disclaimer Banner */}
      <View
        style={[
          styles.disclaimerBanner,
          { backgroundColor: theme.colors.warning + "20" },
        ]}
        accessibilityLabel="Medical disclaimer"
      >
        <Ionicons
          name="information-circle"
          size={20}
          color={theme.colors.warning}
        />
        <Text style={[styles.disclaimerText, { color: theme.colors.text }]}>
          This analysis is for informational purposes only and should not be
          used as a substitute for professional medical diagnosis. Always
          consult a qualified healthcare provider.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="Save to Gallery"
          onPress={handleSave}
          variant="outline"
          icon="download-outline"
          loading={saving}
          style={styles.actionButton}
          accessibilityHint="Saves the analyzed image to your photo gallery"
        />
        <Button
          title="Share Results"
          onPress={handleShare}
          variant="outline"
          icon="share-outline"
          loading={sharing}
          style={styles.actionButton}
          accessibilityHint="Opens share options to send analysis results"
        />
        <Button
          title="New Analysis"
          onPress={handleNewAnalysis}
          variant="primary"
          icon="add-circle-outline"
          style={styles.actionButton}
          accessibilityHint="Returns to home screen to start a new analysis"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 14,
    marginTop: 4,
  },
  imageSection: {
    marginBottom: 16,
  },
  zoomContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrapper: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  zoomHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 48,
  },
  noDetectionContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  noDetectionText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  noDetectionSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  disclaimerBanner: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
});
