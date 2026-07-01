'use client'

import { FRAME_LAYOUT } from '@entities/frame'
import type { ImageSlot } from '@entities/frame'
import { ImageSlotCell } from '@features/image-slot'
import { DecoZone } from './deco-zone'

interface FrameTypeAProps {
  slots: ImageSlot[]
  backgroundColor: string
  interactive: boolean
}

export const FrameTypeA = ({ slots, backgroundColor, interactive }: FrameTypeAProps) => {
  const { paddingX, paddingTop, gap, photoWidth, photoHeight, decoHeight } = FRAME_LAYOUT.A

  return (
    <div className="relative w-full h-full">
      {slots.map((slot, i) => (
        <ImageSlotCell
          key={i}
          slot={slot}
          index={i}
          interactive={interactive}
          style={{
            position: 'absolute',
            left: paddingX,
            top: paddingTop + i * (photoHeight + gap),
            width: photoWidth,
            height: photoHeight,
          }}
        />
      ))}
      <DecoZone
        style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: decoHeight }}
        backgroundColor={backgroundColor}
      />
    </div>
  )
}
