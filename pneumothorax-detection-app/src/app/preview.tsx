import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import Header from "../components/ui/Header";

const { width: screenWidth } = Dimensions.get("window");
const imagePreviewSize = screenWidth - 48;

interface ImageInfo {
  fileName: string;
  fileSize: string;
  uri: string;
}

const isWeb = Platform.OS === "web";

export default function PreviewScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri: string; source: string }>();

  const [imageUri, setImageUri] = useState<string>(params.imageUri || "");
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (params.imageUri) {
      setImageUri(params.imageUri);
    }
  }, [params.imageUri]);

  useEffect(() => {
    if (imageUri) {
      loadImageInfo();
    }
  }, [imageUri]);

  const loadImageInfo = async () => {
    if (!imageUri) {
      setError("No image selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let fileName = "Unknown";
      let fileSize = "Unknown";

      // Extract file name from URI
      const uriParts = imageUri.split("/");
      fileName = uriParts[uriParts.length - 1] || "Unknown";
      // Clean up query params if present (common in web blob URLs)
      if (fileName.includes("?")) {
        fileName = fileName.split("?")[0];
      }

      if (isWeb) {
        // On web, try to fetch the blob to get size
        try {
          if (!imageUri.startsWith("data:")) {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            fileSize = formatFileSize(blob.size);
          } else {
            // For data URLs, estimate size from base64
            const base64Length = imageUri.split(",")[1]?.length || 0;
            fileSize = formatFileSize(Math.floor(base64Length * 0.75));
          }
        } catch {
          fileSize = "Unknown";
        }
      } else {
        // On native, use FileSystem
        const fileInfo = await FileSystem.getInfoAsync(imageUri);

        if (!fileInfo.exists) {
          setError("Image file not found");
          setLoading(false);
          return;
        }

        const fileSizeBytes = fileInfo.size || 0;
        fileSize = formatFileSize(fileSizeBytes);
      }

      setImageInfo({
        fileName,
        fileSize,
        uri: imageUri,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error loading image info:", err);
      // On web, still allow proceeding even if we can't get file info
      if (isWeb) {
        const uriParts = imageUri.split("/");
        let fileName = uriParts[uriParts.length - 1] || "Image";
        if (fileName.includes("?")) {
          fileName = fileName.split("?")[0];
        }
        setImageInfo({
          fileName,
          fileSize: "Unknown",
          uri: imageUri,
        });
        setLoading(false);
      } else {
        setError("Failed to load image information");
        setLoading(false);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleAnalyze = () => {
    if (!imageUri) return;

    setAnalyzing(true);
    router.push({
      pathname: "/analyzing",
      params: { imageUri: imageUri },
    });
  };

  const handleCrop = () => {
    if (!imageUri) return;
    router.push({
      pathname: "/crop",
      params: { imageUri: imageUri },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  const handleImageError = () => {
    setError("Failed to load image preview");
  };

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Header
          title="Image Preview"
          leftIcon="arrow-back"
          onLeftPress={handleCancel}
        />
        <View style={styles.loadingContainer}>
          <Ionicons
            name="image-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Loading image...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Header
          title="Image Preview"
          leftIcon="arrow-back"
          onLeftPress={handleCancel}
        />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
            Error Loading Image
          </Text>
          <Text
            style={[styles.errorMessage, { color: theme.colors.textSecondary }]}
          >
            {error}
          </Text>
          <Button
            title="Go Back"
            onPress={handleCancel}
            variant="primary"
            icon="arrow-back"
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title="Image Preview"
        leftIcon="arrow-back"
        onLeftPress={handleCancel}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <View
          style={[
            styles.imageContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Image
            source={{ uri: imageInfo?.uri }}
            style={styles.previewImage}
            resizeMode="contain"
            onError={handleImageError}
          />
        </View>

        {/* File Info Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Ionicons
              name="document-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                File Name
              </Text>
              <Text
                style={[styles.infoValue, { color: theme.colors.text }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {imageInfo?.fileName}
              </Text>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.infoRow}>
            <Ionicons
              name="resize-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                File Size
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {imageInfo?.fileSize}
              </Text>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.infoRow}>
            <Ionicons
              name="folder-outline"
              size={20}
              color={theme.colors.primary}
            />
            <View style={styles.infoTextContainer}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Source
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {params.source === "camera"
                  ? "Camera Capture"
                  : "Photo Gallery"}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.instructionsText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Tap "Crop" to select a region, or "Analyze" to detect pneumothorax.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          icon="close-outline"
          style={styles.smallButton}
          testID="cancel-button"
          accessibilityHint="Returns to the previous screen without analyzing"
        />
        <Button
          title="Crop"
          onPress={handleCrop}
          variant="outline"
          icon="crop-outline"
          style={styles.smallButton}
          testID="crop-button"
          accessibilityHint="Opens crop tool to select a region of the image"
        />
        <Button
          title="Analyze"
          onPress={handleAnalyze}
          variant="primary"
          icon="scan-outline"
          loading={analyzing}
          style={styles.analyzeButton}
          testID="analyze-button"
          accessibilityHint="Starts AI analysis to detect pneumothorax in the image"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  errorButton: {
    minWidth: 150,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  instructionsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
  },
  smallButton: {
    flex: 1,
  },
  analyzeButton: {
    flex: 1.5,
  },
});
