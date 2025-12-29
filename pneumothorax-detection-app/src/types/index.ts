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
 * API response from pneumopredictor Gradio API
 */
export interface PneumoAPIResponse {
  originalImage: string; // URL to original X-ray
  maskImage: string; // URL to predicted pneumothorax mask
  overlayImage: string; // URL to overlay visualization
  diagnosis: string; // Markdown diagnosis text
}
