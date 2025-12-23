import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.sm,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.textInverse,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Pneumothorax Detection",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "medical" : "medical-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Home tab - Start new analysis",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerTitle: "Analysis History",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "folder-open" : "folder-open-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "History tab - View past analyses",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cog" : "cog-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarAccessibilityLabel: "Settings tab - App preferences",
        }}
      />
    </Tabs>
  );
}
