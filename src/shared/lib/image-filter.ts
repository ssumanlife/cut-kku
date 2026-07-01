import type { ImageFilter } from '@entities/frame'

export const IMAGE_FILTER_STYLE: Record<ImageFilter, string> = {
  none: 'none',
  grayscale: 'grayscale(1)',
  warm: 'sepia(0.4) saturate(1.8) brightness(1.05)',
  cool: 'hue-rotate(200deg) saturate(1.3) brightness(0.95)',
}

export const IMAGE_FILTER_LABEL: Record<ImageFilter, string> = {
  none: '원본',
  grayscale: '흑백',
  warm: '웜톤',
  cool: '쿨톤',
}
