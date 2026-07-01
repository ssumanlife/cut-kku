'use client'

import Image from 'next/image'
import { useEditorStore } from '@entities/frame'
import type { ImageFilter } from '@entities/frame'
import { IMAGE_FILTER_STYLE, IMAGE_FILTER_LABEL } from '@shared/lib/image-filter'

const FILTERS: ImageFilter[] = ['none', 'grayscale', 'warm', 'cool']

export const FilterSelector = () => {
  const frameFilter = useEditorStore((s) => s.frameFilter)
  const slots = useEditorStore((s) => s.slots)
  const setFrameFilter = useEditorStore((s) => s.actions.setFrameFilter)

  // 필터 미리보기용 대표 이미지 (첫 번째 업로드된 슬롯)
  const previewImage = slots.find((s) => s.imageUrl)?.imageUrl ?? null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">필터</p>

      <div className="grid grid-cols-4 gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFrameFilter(f)}
            className={[
              'flex flex-col items-center gap-1 rounded-lg overflow-hidden border-2 transition-all',
              frameFilter === f ? 'border-pink-400' : 'border-transparent hover:border-gray-200',
            ].join(' ')}
          >
            <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={IMAGE_FILTER_LABEL[f]}
                  fill
                  className="object-cover"
                  style={{ filter: IMAGE_FILTER_STYLE[f] }}
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ filter: IMAGE_FILTER_STYLE[f], background: 'linear-gradient(135deg, #e0e0e0 50%, #c0c0c0 50%)' }}
                />
              )}
            </div>
            <span className="text-[10px] text-gray-600 pb-1">{IMAGE_FILTER_LABEL[f]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
