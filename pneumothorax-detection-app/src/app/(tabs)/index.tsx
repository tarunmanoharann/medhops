import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Button from "../../components/ui/Button";

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleUploadImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to upload images.");
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: "/preview",
        params: {
          imageUri: result.assets[0].uri,
          source: "gallery",
        },
      });
    }
  };

  const handleScanImage = () => {
    router.push("/scan");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      accessibilityLabel="Home screen"
    >
      {/* Logo and Title Section */}
      <View style={styles.headerSection} accessibilityRole="header">
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: theme.colors.primaryLight },
          ]}
          accessibilityLabel="Pneumothorax Detection App logo"
        >
          <Ionicons name="medical" size={64} color={theme.colors.primary} />
        </View>
        <Text
          style={[styles.appTitle, { color: theme.colors.text }]}
          accessibilityRole="header"
        >
          Pneumothorax Detection
        </Text>
        <Text style={[styles.appSubtitle, { color: theme.colors.primary }]}>
          AI-Powered Analysis
        </Text>
      </View>

      {/* Description Section */}
      <View
        style={[
          styles.descriptionCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        accessibilityLabel="App description"
      >
        <Text
          style={[
            styles.descriptionText,
            { color: theme.colors.textSecondary },
          ]}
        >
          Upload or scan chest X-ray and CT scan images to detect potential
          pneumothorax (collapsed lung) regions. Our AI-powered analysis
          highlights areas of concern with confidence scores.
        </Text>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.buttonSection}>
        <Button
          title="Upload Image"
          onPress={handleUploadImage}
          variant="primary"
          icon="cloud-upload-outline"
          style={styles.primaryButton}
          testID="upload-button"
          accessibilityHint="Opens your photo gallery to select an X-ray or CT scan image"
        />
        <Button
          title="Scan with Camera"
          onPress={handleScanImage}
          variant="outline"
          icon="camera-outline"
          style={styles.secondaryButton}
          testID="scan-button"
          accessibilityHint="Opens the camera to capture an X-ray or CT scan image"
        />
      </View>

      {/* Info Section */}
      <View style={styles.infoSection} accessibilityLabel="App features">
        <View style={styles.infoItem} accessibilityLabel="Secure and private">
          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color={theme.colors.success}
          />
          <Text
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
          >
            Secure & Private
          </Text>
        </View>
        <View style={styles.infoItem} accessibilityLabel="Fast analysis">
          <Ionicons
            name="flash-outline"
            size={24}
            color={theme.colors.warning}
          />
          <Text
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
          >
            Fast Analysis
          </Text>
        </View>
        <View style={styles.infoItem} accessibilityLabel="AI powered">
          <Ionicons
            name="analytics-outline"
            size={24}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.infoText, { color: theme.colors.textSecondary }]}
          >
            AI Powered
          </Text>
        </View>
      </View>

      {/* Disclaimer */}
      <Text
        style={[styles.disclaimer, { color: theme.colors.textSecondary }]}
        accessibilityLabel="Medical disclaimer"
      >
        This app is for educational purposes only and should not be used as a
        substitute for professional medical diagnosis.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  descriptionCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  buttonSection: {
    width: "100%",
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
  },
  infoItem: {
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
