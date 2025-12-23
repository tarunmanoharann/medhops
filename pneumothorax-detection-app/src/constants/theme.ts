import { TextStyle } from "react-native";

// Color palette definitions
export const colors = {
  // Medical blues - primary palette
  medicalBlue: {
    50: "#E3F2FD",
    100: "#BBDEFB",
    200: "#90CAF9",
    300: "#64B5F6",
    400: "#42A5F5",
    500: "#2196F3",
    600: "#1E88E5",
    700: "#1976D2",
    800: "#1565C0",
    900: "#0D47A1",
  },
  // Neutral grays
  gray: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
  // Semantic colors
  white: "#FFFFFF",
  black: "#000000",
  error: "#D32F2F",
  warning: "#F57C00",
  success: "#388E3C",
  detection: "#E53935", // Red for bounding boxes
};

// Spacing scale (in pixels)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius scale
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Typography scale
export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
};

// Theme interface
export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    text: string;
    textSecondary: string;
    textInverse: string;
    error: string;
    warning: string;
    success: string;
    detection: string;
    border: string;
    disabled: string;
    overlay: string;
  };
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
}

// Light theme
export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.medicalBlue[600],
    primaryLight: colors.medicalBlue[100],
    primaryDark: colors.medicalBlue[800],
    secondary: colors.medicalBlue[400],
    background: colors.gray[50],
    surface: colors.white,
    surfaceVariant: colors.gray[100],
    text: colors.gray[900],
    textSecondary: colors.gray[600],
    textInverse: colors.white,
    error: colors.error,
    warning: colors.warning,
    success: colors.success,
    detection: colors.detection,
    border: colors.gray[300],
    disabled: colors.gray[400],
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  spacing,
  borderRadius,
  typography,
};

// Dark theme
export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.medicalBlue[400],
    primaryLight: colors.medicalBlue[800],
    primaryDark: colors.medicalBlue[200],
    secondary: colors.medicalBlue[300],
    background: colors.gray[900],
    surface: colors.gray[800],
    surfaceVariant: colors.gray[700],
    text: colors.gray[50],
    textSecondary: colors.gray[400],
    textInverse: colors.gray[900],
    error: "#EF5350",
    warning: "#FFB74D",
    success: "#66BB6A",
    detection: "#EF5350",
    border: colors.gray[600],
    disabled: colors.gray[500],
    overlay: "rgba(0, 0, 0, 0.7)",
  },
  spacing,
  borderRadius,
  typography,
};
