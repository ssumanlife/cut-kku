export type FrameType = 'A' | 'B' | 'C'

export type ImageFilter = 'none' | 'grayscale' | 'warm' | 'cool'

export interface ImageSlot {
  imageUrl: string | null
}

export interface TextLayer {
  id: string
  content: string
  x: number
  y: number
  font: string
  fontSize: number
  color: string
}

export interface StickerLayer {
  id: string
  src: string
  x: number
  y: number
  rotate: number
  scale: number
}

export const FRAME_SLOT_COUNT: Record<FrameType, number> = {
  A: 4,
  B: 3,
  C: 4,
}

/**
 * 편집 캔버스 기준 해상도 (단일 스트립)
 * A/B: 1000×3000 → 다운로드 시 ×2 복제 → 최종 2000×3000
 * C:   2000×3000 → 그대로 출력
 */
export const STRIP_DIMENSIONS: Record<FrameType, { width: number; height: number }> = {
  A: { width: 1000, height: 3000 },
  B: { width: 1000, height: 3000 },
  C: { width: 2000, height: 3000 },
}

/**
 * 최종 다운로드 해상도 — A/B는 스트립 2개를 가로로 붙임
 * A: 2000×3000 / B: 2000×3000 / C: 2000×3000
 */
export const EXPORT_DIMENSIONS: Record<FrameType, { width: number; height: number }> = {
  A: { width: 2000, height: 3000 },
  B: { width: 2000, height: 3000 },
  C: { width: 2000, height: 3000 },
}

/** A/B 타입은 스트립을 2장 복제해서 export */
export const FRAME_DUPLICATES: Record<FrameType, number> = {
  A: 2,
  B: 2,
  C: 1,
}

/**
 * 단일 스트립 UI 미리보기 크기 (px) — scale 계산 기준
 * A/B: 스트립 1장 = 300×900, 2장 나란히 표시 시 총 600×900
 * C:   400×600
 */
export const STRIP_PREVIEW_SIZE: Record<FrameType, { width: number; height: number }> = {
  A: { width: 200, height: 600 },
  B: { width: 200, height: 600 },
  C: { width: 400, height: 600 },
}

/**
 * 프레임 레이아웃 상수 (단일 스트립 해상도 기준 px)
 */
export const FRAME_LAYOUT = {
  A: {
    paddingX: 60,
    paddingTop: 130,
    gap: 40,
    photoWidth: 880,
    photoHeight: 590,
    decoHeight: 300,
  },
  B: {
    paddingX: 60,
    paddingTop: 130,
    gap: 60,
    photoWidth: 880,
    photoHeight: 840,
    decoHeight: 180,
  },
  C: {
    paddingX: 60,
    paddingTop: 130,
    colGap: 40,
    rowGap: 40,
    photoWidth: 920,
    photoHeight: 1300,
    decoHeight: 140,
  },
} as const
