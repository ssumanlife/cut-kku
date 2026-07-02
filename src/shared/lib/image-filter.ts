import type { ImageFilter } from "@entities/frame";

export const IMAGE_FILTER_STYLE: Record<ImageFilter, string> = {
  none: "none",
  grayscale: "grayscale(1)",
  warm: "brightness(1.08) contrast(0.92) sepia(0.12) saturate(1.25) drop-shadow(0 0 12px rgba(245, 222, 179, 0.35))",
  cool: "contrast(1.1) brightness(1.05) saturate(0.9) drop-shadow(0 0 10px rgba(135, 206, 250, 0.4))",
};

export const IMAGE_FILTER_LABEL: Record<ImageFilter, string> = {
  none: "원본",
  grayscale: "흑백",
  warm: "웜톤",
  cool: "쿨톤",
};
