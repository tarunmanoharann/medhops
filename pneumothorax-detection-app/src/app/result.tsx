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
  Image,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { useTheme } from "../context/ThemeContext";
import { Card, Button } from "../components/ui";
import { DetectionResult, PneumoAPIResponse } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ResultScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    imageUri: string;
    results: string;
    apiResponse: string;
  }>();

  // Parse results from params
  const results: DetectionResult | null = params.results
    ? JSON.parse(params.results)
    : null;
  const apiResponse: PneumoAPIResponse | null = params.apiResponse
    ? JSON.parse(params.apiResponse)
    : null;
  const imageUri = params.imageUri || "";

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<"original" | "mask" | "overlay">(
    "overlay",
  );

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

      const message = `Pneumothorax Detection Analysis\n\nAnalyzed on: ${formatTimestamp(results?.timestamp || new Date())}`;

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
        {/* Tab selector for different views */}
        {apiResponse && (apiResponse.maskImage || apiResponse.overlayImage) && (
          <View
            style={[
              styles.tabContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Pressable
              style={[
                styles.tab,
                activeTab === "original" && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => setActiveTab("original")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "original" ? "#fff" : theme.colors.text,
                  },
                ]}
              >
                Original
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "mask" && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => setActiveTab("mask")}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === "mask" ? "#fff" : theme.colors.text },
                ]}
              >
                Mask
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                activeTab === "overlay" && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => setActiveTab("overlay")}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === "overlay" ? "#fff" : theme.colors.text,
                  },
                ]}
              >
                Overlay
              </Text>
            </Pressable>
          </View>
        )}

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
            {activeTab === "original" && (
              <Image
                source={{ uri: apiResponse?.originalImage || imageUri }}
                style={styles.resultImage}
                resizeMode="contain"
              />
            )}
            {activeTab === "mask" && apiResponse?.maskImage && (
              <Image
                source={{ uri: apiResponse.maskImage }}
                style={styles.resultImage}
                resizeMode="contain"
              />
            )}
            {activeTab === "overlay" && (
              <Image
                source={{ uri: apiResponse?.overlayImage || imageUri }}
                style={styles.resultImage}
                resizeMode="contain"
              />
            )}
          </View>
        </ScrollView>

        <Text style={[styles.zoomHint, { color: theme.colors.textSecondary }]}>
          Pinch to zoom • Switch tabs to view different visualizations
        </Text>
      </View>

      {/* Diagnosis Card */}
      {apiResponse?.diagnosis && (
        <Card style={styles.diagnosisCard} variant="default">
          <View style={styles.diagnosisHeader}>
            <Ionicons name="medical" size={20} color={theme.colors.primary} />
            <Text style={[styles.diagnosisTitle, { color: theme.colors.text }]}>
              AI Diagnosis
            </Text>
          </View>
          <Text style={[styles.diagnosisText, { color: theme.colors.text }]}>
            {apiResponse.diagnosis}
          </Text>
        </Card>
      )}

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
  tabContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
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
  resultImage: {
    width: "100%",
    height: "100%",
  },
  zoomHint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  diagnosisCard: {
    marginBottom: 16,
  },
  diagnosisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  diagnosisText: {
    fontSize: 14,
    lineHeight: 22,
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
