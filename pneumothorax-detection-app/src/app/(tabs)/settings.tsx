import React from "react";
import { View, Text, StyleSheet, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import Card from "../../components/ui/Card";
import Constants from "expo-constants";

const APP_VERSION = Constants.expoConfig?.version || "1.0.0";

const MEDICAL_DISCLAIMER = `This application is intended for educational and informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment.

The pneumothorax detection feature uses artificial intelligence to analyze chest X-ray and CT scan images. While the technology aims to assist in identifying potential pneumothorax conditions, it should NOT be used as the sole basis for medical decisions.

Important considerations:
• Always consult a qualified healthcare professional for proper diagnosis
• AI-based detection may produce false positives or false negatives
• Results should be verified by a licensed radiologist or physician
• Do not delay seeking medical attention based on app results
• This app is not FDA-approved for clinical diagnosis

By using this application, you acknowledge that you understand these limitations and agree to use the results responsibly.`;

export default function SettingsScreen() {
  const { theme, themeMode, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Settings screen"
      >
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          accessibilityRole="header"
        >
          Settings
        </Text>

        {/* Theme Toggle Section */}
        <Card style={styles.card} variant="elevated">
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  styles.settingDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={themeMode === "dark"}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primaryLight,
              }}
              thumbColor={
                themeMode === "dark"
                  ? theme.colors.primary
                  : theme.colors.surface
              }
              ios_backgroundColor={theme.colors.border}
              accessibilityLabel={`Dark mode ${themeMode === "dark" ? "enabled" : "disabled"}`}
              accessibilityHint="Double tap to toggle dark mode"
              accessibilityRole="switch"
            />
          </View>
        </Card>

        {/* Medical Disclaimer Section */}
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          accessibilityRole="header"
        >
          Medical Disclaimer
        </Text>
        <Card style={styles.card} variant="default">
          <Text
            style={[styles.disclaimerText, { color: theme.colors.text }]}
            accessibilityLabel="Medical disclaimer text"
          >
            {MEDICAL_DISCLAIMER}
          </Text>
        </Card>

        {/* App Info Section */}
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}
          accessibilityRole="header"
        >
          About
        </Text>
        <Card style={styles.card} variant="default">
          <View
            style={styles.infoRow}
            accessibilityLabel={`App version ${APP_VERSION}`}
          >
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
              App Version
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.textSecondary }]}
            >
              {APP_VERSION}
            </Text>
          </View>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
          <View
            style={styles.infoRow}
            accessibilityLabel="Built with Expo SDK 50 plus"
          >
            <Text style={[styles.infoLabel, { color: theme.colors.text }]}>
              Build
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.colors.textSecondary }]}
            >
              Expo SDK 50+
            </Text>
          </View>
        </Card>

        {/* Footer */}
        <Text style={[styles.footer, { color: theme.colors.textSecondary }]}>
          Pneumothorax Detection App
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 32,
  },
});
