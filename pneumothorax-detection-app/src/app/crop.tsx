import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/ui/Button";
import Header from "../components/ui/Header";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CropScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri: string }>();

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [displayedImageSize, setDisplayedImageSize] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [cropRegion, setCropRegion] = useState<CropRegion>({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
  });
  const [cropping, setCropping] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const startPos = useRef({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
  });

  const MIN_SIZE = 50;

  useEffect(() => {
    if (params.imageUri) {
      Image.getSize(
        params.imageUri,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => console.error("Failed to get image size:", error),
      );
    }
  }, [params.imageUri]);

  useEffect(() => {
    if (
      imageSize.width &&
      imageSize.height &&
      containerSize.width &&
      containerSize.height
    ) {
      const imageAspect = imageSize.width / imageSize.height;
      const containerAspect = containerSize.width / containerSize.height;

      let displayWidth, displayHeight, offsetX, offsetY;

      if (imageAspect > containerAspect) {
        displayWidth = containerSize.width;
        displayHeight = containerSize.width / imageAspect;
        offsetX = 0;
        offsetY = (containerSize.height - displayHeight) / 2;
      } else {
        displayHeight = containerSize.height;
        displayWidth = containerSize.height * imageAspect;
        offsetX = (containerSize.width - displayWidth) / 2;
        offsetY = 0;
      }

      setDisplayedImageSize({
        width: displayWidth,
        height: displayHeight,
        offsetX,
        offsetY,
      });

      // Initialize crop region to center
      const initialSize = Math.min(displayWidth, displayHeight) * 0.6;
      setCropRegion({
        x: offsetX + (displayWidth - initialSize) / 2,
        y: offsetY + (displayHeight - initialSize) / 2,
        width: initialSize,
        height: initialSize,
      });
    }
  }, [imageSize, containerSize]);

  const handleContainerLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const constrainCropRegion = (region: CropRegion): CropRegion => {
    const { offsetX, offsetY, width: imgW, height: imgH } = displayedImageSize;

    let { x, y, width, height } = region;

    width = Math.max(MIN_SIZE, Math.min(width, imgW));
    height = Math.max(MIN_SIZE, Math.min(height, imgH));
    x = Math.max(offsetX, Math.min(x, offsetX + imgW - width));
    y = Math.max(offsetY, Math.min(y, offsetY + imgH - height));

    return { x, y, width, height };
  };

  const handleTouchStart = (handle: string) => (e: GestureResponderEvent) => {
    const touch = e.nativeEvent;
    startPos.current = {
      x: touch.pageX,
      y: touch.pageY,
      cropX: cropRegion.x,
      cropY: cropRegion.y,
      cropW: cropRegion.width,
      cropH: cropRegion.height,
    };
    setActiveHandle(handle);
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (!activeHandle) return;

    const touch = e.nativeEvent;
    const dx = touch.pageX - startPos.current.x;
    const dy = touch.pageY - startPos.current.y;

    let newRegion = { ...cropRegion };

    if (activeHandle === "move") {
      newRegion.x = startPos.current.cropX + dx;
      newRegion.y = startPos.current.cropY + dy;
    } else if (activeHandle === "tl") {
      newRegion.x = startPos.current.cropX + dx;
      newRegion.y = startPos.current.cropY + dy;
      newRegion.width = startPos.current.cropW - dx;
      newRegion.height = startPos.current.cropH - dy;
    } else if (activeHandle === "tr") {
      newRegion.y = startPos.current.cropY + dy;
      newRegion.width = startPos.current.cropW + dx;
      newRegion.height = startPos.current.cropH - dy;
    } else if (activeHandle === "bl") {
      newRegion.x = startPos.current.cropX + dx;
      newRegion.width = startPos.current.cropW - dx;
      newRegion.height = startPos.current.cropH + dy;
    } else if (activeHandle === "br") {
      newRegion.width = startPos.current.cropW + dx;
      newRegion.height = startPos.current.cropH + dy;
    }

    setCropRegion(constrainCropRegion(newRegion));
  };

  const handleTouchEnd = () => {
    setActiveHandle(null);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleApplyCrop = async () => {
    if (!params.imageUri || !displayedImageSize.width) return;

    setCropping(true);

    try {
      // Convert display coordinates to actual image coordinates
      const scaleX = imageSize.width / displayedImageSize.width;
      const scaleY = imageSize.height / displayedImageSize.height;

      const originX = Math.round(
        (cropRegion.x - displayedImageSize.offsetX) * scaleX,
      );
      const originY = Math.round(
        (cropRegion.y - displayedImageSize.offsetY) * scaleY,
      );
      const width = Math.round(cropRegion.width * scaleX);
      const height = Math.round(cropRegion.height * scaleY);

      let croppedUri: string;

      if (isWeb) {
        croppedUri = await cropImageWeb(params.imageUri, {
          originX,
          originY,
          width,
          height,
        });
      } else {
        const result = await ImageManipulator.manipulateAsync(
          params.imageUri,
          [{ crop: { originX, originY, width, height } }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.PNG },
        );
        croppedUri = result.uri;
      }

      router.replace({
        pathname: "/preview",
        params: { imageUri: croppedUri, source: "cropped" },
      });
    } catch (error) {
      console.error("Crop failed:", error);
      setCropping(false);
    }
  };

  const cropImageWeb = (
    imageUri: string,
    crop: { originX: number; originY: number; width: number; height: number },
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = crop.width;
        canvas.height = crop.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(
          img,
          crop.originX,
          crop.originY,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height,
        );

        resolve(canvas.toDataURL("image/png", 0.9));
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageUri;
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title="Crop Image"
        leftIcon="arrow-back"
        onLeftPress={handleCancel}
      />

      <View style={styles.imageContainer} onLayout={handleContainerLayout}>
        {params.imageUri && (
          <Image
            source={{ uri: params.imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        {/* Dark overlay outside crop region */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.overlay, { height: cropRegion.y }]} />
          <View style={{ flexDirection: "row", height: cropRegion.height }}>
            <View style={[styles.overlay, { width: cropRegion.x }]} />
            <View style={{ width: cropRegion.width }} />
            <View style={[styles.overlay, { flex: 1 }]} />
          </View>
          <View style={[styles.overlay, { flex: 1 }]} />
        </View>

        {/* Crop frame */}
        <View
          style={[
            styles.cropFrame,
            {
              left: cropRegion.x,
              top: cropRegion.y,
              width: cropRegion.width,
              height: cropRegion.height,
              borderColor: theme.colors.primary,
            },
          ]}
          onTouchStart={handleTouchStart("move")}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Corner handles */}
          <View
            style={[
              styles.handle,
              styles.handleTL,
              { backgroundColor: theme.colors.primary },
            ]}
            onTouchStart={handleTouchStart("tl")}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <View
            style={[
              styles.handle,
              styles.handleTR,
              { backgroundColor: theme.colors.primary },
            ]}
            onTouchStart={handleTouchStart("tr")}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <View
            style={[
              styles.handle,
              styles.handleBL,
              { backgroundColor: theme.colors.primary },
            ]}
            onTouchStart={handleTouchStart("bl")}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <View
            style={[
              styles.handle,
              styles.handleBR,
              { backgroundColor: theme.colors.primary },
            ]}
            onTouchStart={handleTouchStart("br")}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Grid lines */}
          <View style={[styles.gridLineH, { top: "33.33%" }]} />
          <View style={[styles.gridLineH, { top: "66.66%" }]} />
          <View style={[styles.gridLineV, { left: "33.33%" }]} />
          <View style={[styles.gridLineV, { left: "66.66%" }]} />
        </View>
      </View>

      <View style={styles.instructions}>
        <Ionicons
          name="move-outline"
          size={20}
          color={theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.instructionsText,
            { color: theme.colors.textSecondary },
          ]}
        >
          Drag to move, use corners to resize
        </Text>
      </View>

      <View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="outline"
          icon="close-outline"
          style={styles.button}
        />
        <Button
          title="Apply Crop"
          onPress={handleApplyCrop}
          variant="primary"
          icon="checkmark-outline"
          loading={cropping}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { flex: 1, position: "relative" },
  image: { width: "100%", height: "100%" },
  overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
  cropFrame: { position: "absolute", borderWidth: 2 },
  handle: { position: "absolute", width: 24, height: 24, borderRadius: 12 },
  handleTL: { top: -12, left: -12 },
  handleTR: { top: -12, right: -12 },
  handleBL: { bottom: -12, left: -12 },
  handleBR: { bottom: -12, right: -12 },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  instructions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
  },
  instructionsText: { fontSize: 14 },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
  },
  button: { flex: 1 },
});
