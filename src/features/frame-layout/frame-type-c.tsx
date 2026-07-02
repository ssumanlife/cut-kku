'use client'

import { FRAME_LAYOUT } from '@entities/frame'
import type { ImageSlot } from '@entities/frame'
import { ImageSlotCell } from '@features/image-slot'
import { DecoZone } from './deco-zone'
import { FrameLogo } from './frame-logo'

interface FrameTypeCProps {
  slots: ImageSlot[]
  backgroundColor: string
  interactive: boolean
}

const POSITIONS = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
]

export const FrameTypeC = ({ slots, backgroundColor, interactive }: FrameTypeCProps) => {
  const { paddingX, paddingTop, colGap, rowGap, photoWidth, photoHeight, decoHeight } = FRAME_LAYOUT.C

  return (
    <div className="relative w-full h-full">
      {slots.map((slot, i) => {
        const { col, row } = POSITIONS[i]
        return (
          <ImageSlotCell
            key={i}
            slot={slot}
            index={i}
            interactive={interactive}
            style={{
              position: 'absolute',
              left: paddingX + col * (photoWidth + colGap),
              top: paddingTop + row * (photoHeight + rowGap),
              width: photoWidth,
              height: photoHeight,
            }}
          />
        )
      })}
      <DecoZone
        style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: decoHeight }}
        backgroundColor={backgroundColor}
      />
      <FrameLogo paddingTop={paddingTop} paddingX={paddingX} decoHeight={decoHeight} totalHeight={3000} />
    </div>
  )
}
