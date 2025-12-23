/**
 * Mock Detection Service
 * Simulates pneumothorax detection API for UI development
 * Requirements: 4.4, 5.2
 */

import { BoundingBox, DetectionResult, MockDetectionOptions } from "../types";

/**
 * Generates a unique ID for detection results
 */
function generateId(): string {
  return `detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates random bounding boxes in typical lung regions
 * Lung regions are typically in the upper 60% of chest X-rays,
 * with left lung roughly 10-45% from left and right lung 55-90% from left
 * @param count Number of bounding boxes to generate
 */
export function generateMockBoundingBoxes(count: number): BoundingBox[] {
  const boxes: BoundingBox[] = [];

  for (let i = 0; i < count; i++) {
    // Randomly choose left or right lung region
    const isLeftLung = Math.random() > 0.5;

    // X position: left lung (10-40%), right lung (55-85%)
    const xMin = isLeftLung ? 10 : 55;
    const xMax = isLeftLung ? 40 : 85;

    // Y position: upper portion of image (10-55%) where lungs typically appear
    const yMin = 10;
    const yMax = 55;

    // Generate position within lung region
    const x = xMin + Math.random() * (xMax - xMin - 15); // Leave room for width
    const y = yMin + Math.random() * (yMax - yMin - 15); // Leave room for height

    // Box dimensions: typically 8-20% of image
    const width = 8 + Math.random() * 12;
    const height = 8 + Math.random() * 12;

    // Confidence score: typically 0.6-0.98 for detected regions
    const confidence = 0.6 + Math.random() * 0.38;

    boxes.push({
      id: i + 1,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
    });
  }

  return boxes;
}

/**
 * Calculates the average confidence from an array of bounding boxes
 * @param boxes Array of bounding boxes with confidence scores
 */
export function calculateAverageConfidence(boxes: BoundingBox[]): number {
  if (boxes.length === 0) return 0;
  const sum = boxes.reduce((acc, box) => acc + box.confidence, 0);
  return Math.round((sum / boxes.length) * 100) / 100;
}

/**
 * Simulates pneumothorax detection analysis on an image
 * @param imageUri URI of the image to analyze
 * @param options Configuration options for the mock service
 * @returns Promise resolving to DetectionResult
 */
export async function analyzeImage(
  imageUri: string,
  options?: MockDetectionOptions,
): Promise<DetectionResult> {
  const delay = options?.simulateDelay ?? 2500;
  const startTime = Date.now();

  // Simulate network/processing delay (Requirement 4.4: 2-3 second delay)
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Determine if pneumothorax should be detected
  // If not specified, 70% chance of detection for demo purposes
  const shouldDetect = options?.detectPneumothorax ?? Math.random() > 0.3;

  const processingTime = Date.now() - startTime;

  if (!shouldDetect) {
    return {
      id: generateId(),
      imageUri,
      timestamp: new Date(),
      status: "not_detected",
      boundingBoxes: [],
      averageConfidence: 0,
      processingTime,
    };
  }

  // Generate 1-3 detection regions for positive cases
  const detectionCount = 1 + Math.floor(Math.random() * 3);
  const boundingBoxes = generateMockBoundingBoxes(detectionCount);
  const averageConfidence = calculateAverageConfidence(boundingBoxes);

  return {
    id: generateId(),
    imageUri,
    timestamp: new Date(),
    status: "detected",
    boundingBoxes,
    averageConfidence,
    processingTime,
  };
}

/**
 * Creates a mock error result for testing error states
 * @param imageUri URI of the image that failed analysis
 */
export function createErrorResult(imageUri: string): DetectionResult {
  return {
    id: generateId(),
    imageUri,
    timestamp: new Date(),
    status: "error",
    boundingBoxes: [],
    averageConfidence: 0,
    processingTime: 0,
  };
}
