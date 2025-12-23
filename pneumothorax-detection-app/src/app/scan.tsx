import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Image,
  StatusBar,
  Alert,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AlignmentGuide from "../components/AlignmentGuide";
import { useTheme } from "../context/ThemeContext";

/**
 * AnimatedControlButton - Camera control button with press animation
 */
function AnimatedControlButton({
  onPress,
  icon,
  accessibilityLabel,
  style,
}: {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  style?: any;
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
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        style={[
          styles.controlButton,
          style,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons name={icon} size={24} color="#fff" />
      </Animated.View>
    </Pressable>
  );
}

/**
 * ScanScreen - Camera interface for capturing medical images
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
export default function ScanScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const cameraRef = useRef<CameraView>(null);
  const captureScaleAnim = useRef(new Animated.Value(1)).current;

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Request camera permission on mount if not determined
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      // Permission will be requested when user interacts
    }
  }, [permission]);

  const handleClose = () => {
    router.back();
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCapturePressIn = useCallback(() => {
    Animated.spring(captureScaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [captureScaleAnim]);

  const handleCapturePressOut = useCallback(() => {
    Animated.spring(captureScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [captureScaleAnim]);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo) {
          setCapturedImage(photo.uri);
          setShowPreview(true);
        }
      } catch (error) {
        console.error("Failed to capture image:", error);
        Alert.alert("Error", "Failed to capture image. Please try again.");
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowPreview(false);
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      setShowPreview(false);
      router.push({
        pathname: "/preview",
        params: { imageUri: capturedImage, source: "camera" },
      });
    }
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <View style={styles.container} accessibilityLabel="Camera screen loading">
        <StatusBar barStyle="light-content" />
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.container}
        accessibilityLabel="Camera permission required screen"
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#fff" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            To scan medical images, we need access to your camera. This allows
            you to capture X-rays or CT scans displayed on screens or
            lightboxes.
          </Text>
          <Pressable
            style={[
              styles.permissionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={requestPermission}
            accessibilityRole="button"
            accessibilityLabel="Grant camera permission"
            accessibilityHint="Allows the app to use your camera to capture medical images"
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
          <Pressable
            style={styles.backButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Go back to home screen"
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Main camera view
  return (
    <View style={styles.container} accessibilityLabel="Camera scan screen">
      <StatusBar barStyle="light-content" />

      {/* Full-screen camera preview - Requirement 3.1 */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Alignment guide overlay - Requirement 3.2 */}
        <AlignmentGuide visible={true} />

        {/* Top controls bar */}
        <SafeAreaView style={styles.topBar}>
          {/* Close button - Requirement 3.8 */}
          <AnimatedControlButton
            onPress={handleClose}
            icon="close"
            accessibilityLabel="Close camera and return to home"
          />

          {/* Flash toggle - Requirement 3.4 */}
          <AnimatedControlButton
            onPress={toggleFlash}
            icon={flash === "off" ? "flash-off" : "flash"}
            accessibilityLabel={`Flash is ${flash === "off" ? "off" : "on"}. Double tap to toggle`}
          />
        </SafeAreaView>

        {/* Tips text - Requirement 3.7 */}
        <View style={styles.tipsContainer} accessibilityLabel="Camera tips">
          <Text style={styles.tipsText}>
            Position the X-ray or CT scan within the frame
          </Text>
          <Text style={styles.tipsSubtext}>
            Ensure good lighting and avoid glare
          </Text>
        </View>

        {/* Bottom controls bar */}
        <SafeAreaView style={styles.bottomBar}>
          {/* Camera flip button - Requirement 3.5 */}
          <AnimatedControlButton
            onPress={toggleCameraFacing}
            icon="camera-reverse-outline"
            accessibilityLabel={`Using ${facing} camera. Double tap to switch`}
            style={styles.sideButton}
          />

          {/* Capture button - Requirement 3.3 */}
          <Pressable
            onPress={handleCapture}
            onPressIn={handleCapturePressIn}
            onPressOut={handleCapturePressOut}
            accessibilityRole="button"
            accessibilityLabel="Capture photo"
            accessibilityHint="Takes a photo of the medical image"
          >
            <Animated.View
              style={[
                styles.captureButton,
                { transform: [{ scale: captureScaleAnim }] },
              ]}
            >
              <View style={styles.captureButtonInner} />
            </Animated.View>
          </Pressable>

          {/* Placeholder for symmetry */}
          <View style={styles.sideButton} />
        </SafeAreaView>
      </CameraView>

      {/* Capture preview modal - Requirement 3.6 */}
      <Modal
        visible={showPreview}
        animationType="fade"
        transparent={false}
        onRequestClose={handleRetake}
      >
        <View
          style={styles.previewContainer}
          accessibilityLabel="Photo preview screen"
        >
          <StatusBar barStyle="light-content" />

          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
              resizeMode="contain"
              accessibilityLabel="Captured photo preview"
            />
          )}

          <SafeAreaView style={styles.previewButtons}>
            {/* Retake button */}
            <Pressable
              style={[styles.previewButton, styles.retakeButton]}
              onPress={handleRetake}
              accessibilityRole="button"
              accessibilityLabel="Retake photo"
              accessibilityHint="Discards this photo and returns to camera"
            >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </Pressable>

            {/* Use button */}
            <Pressable
              style={[
                styles.previewButton,
                styles.useButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleUsePhoto}
              accessibilityRole="button"
              accessibilityLabel="Use this photo"
              accessibilityHint="Proceeds to analyze this photo for pneumothorax"
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
              <Text style={styles.previewButtonText}>Use Photo</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  // Permission screens
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: "#ccc",
  },
  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Tips
  tipsContainer: {
    position: "absolute",
    top: "15%",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  tipsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tipsSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  // Preview modal
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  previewImage: {
    flex: 1,
    width: "100%",
  },
  previewButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    gap: 8,
  },
  retakeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  useButton: {
    // backgroundColor set dynamically with theme
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
