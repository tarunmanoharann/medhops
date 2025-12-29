import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DetectionResult, HistoryItem, PneumoAPIResponse } from "../types";

const HISTORY_STORAGE_KEY = "@pneumothorax_app_history";

interface AnalysisContextValue {
  currentAnalysis: DetectionResult | null;
  history: HistoryItem[];
  isLoading: boolean;
  setCurrentAnalysis: (analysis: DetectionResult | null) => void;
  addToHistory: (
    result: DetectionResult,
    apiResponse?: PneumoAPIResponse,
  ) => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(
  undefined,
);

interface AnalysisProviderProps {
  children: ReactNode;
}

export function AnalysisProvider({ children }: AnalysisProviderProps) {
  const [currentAnalysis, setCurrentAnalysis] =
    useState<DetectionResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from AsyncStorage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.warn("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(newHistory),
      );
    } catch (error) {
      console.warn("Failed to save history:", error);
      throw error;
    }
  };

  const addToHistory = useCallback(
    async (result: DetectionResult, apiResponse?: PneumoAPIResponse) => {
      const historyItem: HistoryItem = {
        id: result.id,
        imageUri: result.imageUri,
        thumbnailUri: result.imageUri,
        timestamp:
          result.timestamp instanceof Date
            ? result.timestamp.toISOString()
            : result.timestamp,
        detectionsCount: result.boundingBoxes.length,
        averageConfidence: result.averageConfidence,
        boundingBoxes: result.boundingBoxes,
        apiResponse: apiResponse,
      };

      const newHistory = [historyItem, ...history];
      setHistory(newHistory);
      await saveHistory(newHistory);
    },
    [history],
  );

  const removeFromHistory = useCallback(
    async (id: string) => {
      const newHistory = history.filter((item) => item.id !== id);
      setHistory(newHistory);
      await saveHistory(newHistory);
    },
    [history],
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const value: AnalysisContextValue = {
    currentAnalysis,
    history,
    isLoading,
    setCurrentAnalysis,
    addToHistory,
    removeFromHistory,
    clearHistory,
    loadHistory,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis(): AnalysisContextValue {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}

export { AnalysisContext };
