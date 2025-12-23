/**
 * History Screen - Display list of previous analyses
 * Requirements: 7.1, 7.3, 7.5
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAnalysis } from "../../context/AnalysisContext";
import HistoryCard from "../../components/HistoryCard";
import { HistoryItem, DetectionResult } from "../../types";

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { history, isLoading, removeFromHistory, loadHistory } = useAnalysis();
  const router = useRouter();

  // Handle item press - navigate to result view
  const handleItemPress = useCallback(
    (item: HistoryItem) => {
      // Convert HistoryItem back to DetectionResult for result screen
      const result: DetectionResult = {
        id: item.id,
        imageUri: item.imageUri,
        timestamp: new Date(item.timestamp),
        status: item.detectionsCount > 0 ? "detected" : "not_detected",
        boundingBoxes: item.boundingBoxes,
        averageConfidence: item.averageConfidence,
        processingTime: 0,
      };

      router.push({
        pathname: "/result",
        params: {
          imageUri: item.imageUri,
          results: JSON.stringify(result),
        },
      });
    },
    [router],
  );

  // Handle delete with confirmation
  const handleDelete = useCallback(
    (item: HistoryItem) => {
      Alert.alert(
        "Delete Analysis",
        "Are you sure you want to delete this analysis from history?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => removeFromHistory(item.id),
          },
        ],
      );
    },
    [removeFromHistory],
  );

  // Render individual history item
  const renderItem = useCallback(
    ({ item }: { item: HistoryItem }) => (
      <HistoryCard
        id={item.id}
        thumbnailUri={item.thumbnailUri}
        date={new Date(item.timestamp)}
        detectionsCount={item.detectionsCount}
        onPress={() => handleItemPress(item)}
        onDelete={() => handleDelete(item)}
      />
    ),
    [handleItemPress, handleDelete],
  );

  // Render empty state
  const renderEmptyState = () => (
    <View
      style={styles.emptyContainer}
      accessibilityLabel="No analysis history"
    >
      <Ionicons
        name="time-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Analysis History
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        Your previous analyses will appear here. Start by uploading or scanning
        a chest X-ray image.
      </Text>
    </View>
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: HistoryItem) => item.id, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      accessibilityLabel="History screen"
    >
      {/* Header */}
      <View style={styles.header} accessibilityRole="header">
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Analysis History
        </Text>
        {history.length > 0 && (
          <Text
            style={[styles.count, { color: theme.colors.textSecondary }]}
            accessibilityLabel={`${history.length} ${history.length !== 1 ? "analyses" : "analysis"} in history`}
          >
            {history.length} analysis{history.length !== 1 ? "es" : ""}
          </Text>
        )}
      </View>

      {/* History List */}
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadHistory}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            accessibilityLabel="Pull to refresh history"
          />
        }
        showsVerticalScrollIndicator={false}
        accessibilityLabel={`History list with ${history.length} items`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  count: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
