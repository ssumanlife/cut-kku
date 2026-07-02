'use client'

import { FRAME_LAYOUT } from '@entities/frame'
import type { ImageSlot } from '@entities/frame'
import { ImageSlotCell } from '@features/image-slot'
import { DecoZone } from './deco-zone'
import { FrameLogo } from './frame-logo'

interface FrameTypeBProps {
  slots: ImageSlot[]
  backgroundColor: string
  interactive: boolean
}

export const FrameTypeB = ({ slots, backgroundColor, interactive }: FrameTypeBProps) => {
  const { paddingX, paddingTop, gap, photoWidth, photoHeight, decoHeight } = FRAME_LAYOUT.B

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
      <FrameLogo paddingTop={paddingTop} paddingX={paddingX} decoHeight={decoHeight} totalHeight={3000} />
    </div>
  )
}
