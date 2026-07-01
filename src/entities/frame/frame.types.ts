export type FrameType = 'A' | 'B' | 'C'

export type ImageFilter = 'none' | 'grayscale' | 'warm' | 'cool'

export interface ImageSlot {
  imageUrl: string | null
  filter: ImageFilter
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
