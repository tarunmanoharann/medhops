import { DetectionResult, BoundingBox } from "../types";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";

const API_BASE = "https://yashwanthsc-pneumopredictor.hf.space";
const TARGET_SIZE = 256;
const isWeb = Platform.OS === "web";

function generateId(): string {
  return `detection-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Resize image to 256x256 using Canvas API (web only)
 */
async function resizeImageWeb(imageUri: string): Promise<string> {
  console.log("Resizing image on web to 256x256...");

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, TARGET_SIZE, TARGET_SIZE);
      const resizedUri = canvas.toDataURL("image/png", 0.8);
      console.log("Image resized successfully on web");
      resolve(resizedUri);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for resizing"));
    };

    img.src = imageUri;
  });
}

/**
 * Resize image to 256x256 using expo-image-manipulator (native only)
 */
async function resizeImageNative(imageUri: string): Promise<string> {
  console.log("Resizing image on native to 256x256...");

  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: TARGET_SIZE, height: TARGET_SIZE } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.PNG },
  );

  console.log("Image resized successfully:", result.uri);
  return result.uri;
}

/**
 * Resize image to 256x256 before sending to API
 */
async function resizeImage(imageUri: string): Promise<string> {
  if (isWeb) {
    return resizeImageWeb(imageUri);
  }
  return resizeImageNative(imageUri);
}

export interface PneumoAPIResponse {
  originalImage: string;
  maskImage: string;
  overlayImage: string;
  diagnosis: string;
}

/**
 * Convert data URL to Blob (for web)
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

async function uploadImageToGradio(imageUri: string): Promise<string> {
  console.log("Uploading image to Gradio...");

  const formData = new FormData();

  if (isWeb) {
    // On web, convert data URL to Blob and append as File
    const blob = imageUri.startsWith("data:")
      ? dataURLtoBlob(imageUri)
      : await fetch(imageUri).then((r) => r.blob());
    const file = new File([blob], "xray.png", { type: "image/png" });
    formData.append("files", file);
  } else {
    // On native, use the RN file object format
    const imageData = {
      uri: imageUri,
      type: "image/png",
      name: "xray.png",
    } as any;
    formData.append("files", imageData);
  }

  const uploadResponse = await fetch(`${API_BASE}/gradio_api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("Upload error:", errorText);
    throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
  }

  const uploadResult = await uploadResponse.json();
  console.log("Upload result:", uploadResult);

  return uploadResult[0];
}

async function predictWithGradioAPI(filePath: string): Promise<any> {
  console.log("Making prediction with Gradio API...");

  const callResponse = await fetch(`${API_BASE}/gradio_api/call/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [
        {
          path: filePath,
          meta: {
            _type: "gradio.FileData",
          },
        },
      ],
    }),
  });

  if (!callResponse.ok) {
    const errorText = await callResponse.text();
    throw new Error(
      `Call predict failed: ${callResponse.status} - ${errorText}`,
    );
  }

  const callResult = await callResponse.json();
  const eventId = callResult.event_id;
  console.log("Event ID:", eventId);

  console.log("Polling for result...");
  const resultResponse = await fetch(
    `${API_BASE}/gradio_api/call/predict/${eventId}`,
  );

  if (!resultResponse.ok) {
    throw new Error(`Result fetch failed: ${resultResponse.status}`);
  }

  const resultText = await resultResponse.text();
  console.log("Raw result:", resultText.substring(0, 200));

  const lines = resultText.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed && parsed.output && parsed.output.data) {
          return { data: parsed.output.data };
        }
        if (Array.isArray(parsed)) {
          return { data: parsed };
        }
      } catch (e) {}
    }
  }

  throw new Error("No valid result data found");
}

async function predictWithBase64(imageUri: string): Promise<any> {
  console.log("Trying base64 prediction...");

  let base64: string;

  // If already a data URL (from web resize), use directly
  if (imageUri.startsWith("data:")) {
    base64 = imageUri;
  } else {
    // Otherwise fetch and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();

    base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const callResponse = await fetch(`${API_BASE}/gradio_api/call/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [base64],
    }),
  });

  if (!callResponse.ok) {
    const errorText = await callResponse.text();
    throw new Error(
      `Base64 call failed: ${callResponse.status} - ${errorText}`,
    );
  }

  const callResult = await callResponse.json();
  const eventId = callResult.event_id;

  const resultResponse = await fetch(
    `${API_BASE}/gradio_api/call/predict/${eventId}`,
  );

  if (!resultResponse.ok) {
    throw new Error(`Base64 result fetch failed: ${resultResponse.status}`);
  }

  const resultText = await resultResponse.text();

  const lines = resultText.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed && parsed.output && parsed.output.data) {
          return { data: parsed.output.data };
        }
        if (Array.isArray(parsed)) {
          return { data: parsed };
        }
      } catch (e) {}
    }
  }

  throw new Error("No valid base64 result found");
}

function extractImageUrl(data: any): string {
  if (!data) return "";
  if (typeof data === "string") {
    if (data.startsWith("http") || data.startsWith("data:")) return data;
    return `${API_BASE}/gradio_api/file=${data}`;
  }
  if (data.url) return data.url;
  if (data.path) return `${API_BASE}/gradio_api/file=${data.path}`;
  return "";
}

export async function analyzeImage(
  imageUri: string,
): Promise<{ result: DetectionResult; apiResponse: PneumoAPIResponse }> {
  const startTime = Date.now();

  try {
    console.log("Starting pneumothorax analysis...");

    // Resize image to 256x256 before sending to API
    const resizedImageUri = await resizeImage(imageUri);

    let prediction: any;

    try {
      const filePath = await uploadImageToGradio(resizedImageUri);
      prediction = await predictWithGradioAPI(filePath);
    } catch (uploadError) {
      console.log("Upload approach failed, trying base64:", uploadError);
      prediction = await predictWithBase64(resizedImageUri);
    }

    const processingTime = Date.now() - startTime;
    const data = prediction.data || [];

    const apiResponse: PneumoAPIResponse = {
      originalImage: extractImageUrl(data[0]),
      maskImage: extractImageUrl(data[1]),
      overlayImage: extractImageUrl(data[2]),
      diagnosis: typeof data[3] === "string" ? data[3] : String(data[3] || ""),
    };

    console.log("Diagnosis:", apiResponse.diagnosis);

    const diagLower = apiResponse.diagnosis.toLowerCase();
    const hasDetection =
      diagLower.includes("pneumothorax detected") ||
      diagLower.includes("positive") ||
      diagLower.includes("🔴") ||
      (diagLower.includes("pneumothorax") &&
        !diagLower.includes("no pneumothorax") &&
        !diagLower.includes("not detected") &&
        !diagLower.includes("negative") &&
        !diagLower.includes("🟢"));

    let confidence = 0;
    const match = apiResponse.diagnosis.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) {
      confidence = parseFloat(match[1]) / 100;
    }

    const boundingBoxes: BoundingBox[] = [];

    return {
      result: {
        id: generateId(),
        imageUri,
        timestamp: new Date(),
        status: hasDetection ? "detected" : "not_detected",
        boundingBoxes,
        averageConfidence: confidence,
        processingTime,
      },
      apiResponse,
    };
  } catch (error) {
    console.error("API error:", error);

    return {
      result: {
        id: generateId(),
        imageUri,
        timestamp: new Date(),
        status: "error",
        boundingBoxes: [],
        averageConfidence: 0,
        processingTime: Date.now() - startTime,
      },
      apiResponse: {
        originalImage: "",
        maskImage: "",
        overlayImage: "",
        diagnosis: `Error: ${error instanceof Error ? error.message : "Analysis failed. Please try again."}`,
      },
    };
  }
}
