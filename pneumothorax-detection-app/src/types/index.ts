/**
 * TypeScript interfaces for Pneumothorax Detection App
 * Requirements: 5.2, 5.5, 7.2
 */

/**
 * Represents a detected region on the medical image
 * Used by the Overlay_Renderer to draw highlighted regions
 */
export interface BoundingBox {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  confidence: number; // 0-1
}

/**
 * Result of the pneumothorax detection analysis
 * Contains all detection data including bounding boxes and confidence scores
 */
export interface DetectionResult {
  id: string;
  imageUri: string;
  timestamp: Date;
  status: "detected" | "not_detected" | "error";
  boundingBoxes: BoundingBox[];
  averageConfidence: number;
  processingTime: number; // milliseconds
}

/**
 * Represents a saved analysis in the history
 * Used by History_Screen to display previous analyses
 */
export interface HistoryItem {
  id: string;
  imageUri: string;
  thumbnailUri: string;
  timestamp: string; // ISO date string
  detectionsCount: number;
  averageConfidence: number;
  boundingBoxes: BoundingBox[];
}

/**
 * Global application state
 * Managed by React Context providers
 */
export interface AppState {
  theme: "light" | "dark";
  disclaimerAccepted: boolean;
  history: HistoryItem[];
  currentAnalysis: DetectionResult | null;
}

/**
 * Navigation parameter types for type-safe navigation
 */
export type RootStackParamList = {
  "(tabs)": undefined;
  scan: undefined;
  preview: {
    imageUri: string;
    source: "gallery" | "camera";
  };
  analyzing: {
    imageUri: string;
  };
  result: {
    imageUri: string;
    results: DetectionResult;
  };
};

export type TabParamList = {
  index: undefined;
  history: undefined;
  settings: undefined;
};

/**
 * Props for ImageOverlay component
 */
export interface ImageOverlayProps {
  imageUri: string;
  boundingBoxes: BoundingBox[];
  onBoxPress?: (box: BoundingBox) => void;
  showLabels?: boolean;
}

/**
 * Props for HistoryCard component
 */
export interface HistoryCardProps {
  id: string;
  thumbnailUri: string;
  date: Date;
  detectionsCount: number;
  onPress: () => void;
  onDelete: () => void;
}

/**
 * Props for Button component
 */
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

/**
 * Props for AlignmentGuide component
 */
export interface AlignmentGuideProps {
  visible: boolean;
}

/**
 * Options for mock detection service
 */
export interface MockDetectionOptions {
  simulateDelay?: number; // default 2500ms
  detectPneumothorax?: boolean; // default random
}
