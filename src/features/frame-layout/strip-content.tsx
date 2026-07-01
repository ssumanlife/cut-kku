'use client'

import type { FrameType, ImageSlot } from '@entities/frame'
import { FrameTypeA } from './frame-type-a'
import { FrameTypeB } from './frame-type-b'
import { FrameTypeC } from './frame-type-c'

interface StripContentProps {
  type: FrameType
  slots: ImageSlot[]
  backgroundColor: string
  interactive: boolean
}

export const StripContent = ({ type, slots, backgroundColor, interactive }: StripContentProps) => {
  if (type === 'A') return <FrameTypeA slots={slots} backgroundColor={backgroundColor} interactive={interactive} />
  if (type === 'B') return <FrameTypeB slots={slots} backgroundColor={backgroundColor} interactive={interactive} />
  return <FrameTypeC slots={slots} backgroundColor={backgroundColor} interactive={interactive} />
}
