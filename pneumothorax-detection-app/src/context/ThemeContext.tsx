import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, lightTheme, darkTheme } from "../constants/theme";

const THEME_STORAGE_KEY = "@pneumothorax_app_theme";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeModeState(savedTheme);
      }
    } catch (error) {
      console.warn("Failed to load theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const persistThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Failed to persist theme preference:", error);
    }
  };

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    persistThemePreference(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === "light" ? "dark" : "light";
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  const theme = themeMode === "dark" ? darkTheme : lightTheme;

  const value: ThemeContextValue = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export for convenience
export { ThemeContext };
