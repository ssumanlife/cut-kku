'use client'

import Image from 'next/image'
import { useEditorStore } from '@entities/frame'
import type { ImageFilter, ImageSlot } from '@entities/frame'
import { IMAGE_FILTER_STYLE } from '@shared/lib/image-filter'

interface ImageSlotProps {
  slot: ImageSlot
  index: number
  interactive: boolean
  style: React.CSSProperties
}

export const ImageSlotCell = ({ slot, index, interactive, style }: ImageSlotProps) => {
  const setSlotImage = useEditorStore((s) => s.actions.setSlotImage)
  const frameFilter = useEditorStore((s) => s.frameFilter)

  const openFilePicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setSlotImage(index, URL.createObjectURL(file))
    }
    input.click()
  }

  return (
    <div
      style={style}
      className={`overflow-hidden group ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={interactive ? openFilePicker : undefined}
    >
      {slot.imageUrl ? (
        <FilledSlot
          imageUrl={slot.imageUrl}
          frameFilter={frameFilter}
          interactive={interactive}
          index={index}
        />
      ) : (
        <EmptySlot interactive={interactive} />
      )}
    </div>
  )
}

const FilledSlot = ({
  imageUrl,
  frameFilter,
  interactive,
  index,
}: {
  imageUrl: string
  frameFilter: ImageFilter
  interactive: boolean
  index: number
}) => (
  <div className="relative w-full h-full">
    <Image
      src={imageUrl}
      alt={`슬롯 ${index + 1}`}
      fill
      className="object-cover"
      style={{ filter: IMAGE_FILTER_STYLE[frameFilter] }}
      draggable={false}
      unoptimized
    />
    {interactive && (
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
        <span className="text-white text-2xl font-medium">변경</span>
      </div>
    )}
  </div>
)

const EmptySlot = ({ interactive }: { interactive: boolean }) => (
  <div
    className={`w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3 ${
      interactive ? 'bg-gray-100 hover:bg-gray-200 transition-colors' : 'bg-gray-50'
    }`}
  >
    {interactive && (
      <>
        <span style={{ fontSize: 60 }}>📷</span>
        <span style={{ fontSize: 28 }}>사진 추가</span>
      </>
    )}
  </div>
)
