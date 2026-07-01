'use client'

import { useState } from 'react'
import { useEditorStore, STRIP_DIMENSIONS } from '@entities/frame'
import { STICKER_CATEGORIES } from '@entities/sticker'

export const StickerPanel = () => {
  const frameType = useEditorStore((s) => s.frameType)
  const addSticker = useEditorStore((s) => s.actions.addSticker)
  const [activeCategory, setActiveCategory] = useState('sanrio')

  const { width, height } = STRIP_DIMENSIONS[frameType]

  const handleAddBuiltin = (src: string) => {
    addSticker({
      src,
      x: Math.round(width / 2 - 60),
      y: Math.round(height / 2 - 60),
      rotate: 0,
      scale: 3,
    })
  }

  const handleUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const src = URL.createObjectURL(file)
      addSticker({
        src,
        x: Math.round(width / 2 - 60),
        y: Math.round(height / 2 - 60),
        rotate: 0,
        scale: 1,
      })
    }
    input.click()
  }

  const currentCategory = STICKER_CATEGORIES.find((c) => c.id === activeCategory)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">스티커</p>

      {/* 카테고리 탭 */}
      <div className="flex gap-1">
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={[
              'flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-pink-400 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            ].join(' ')}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 스티커 그리드 */}
      <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-0.5">
        {currentCategory?.stickers.map((s) => (
          <button
            key={s.id}
            onClick={() => handleAddBuiltin(s.src)}
            className="flex items-center justify-center p-1 rounded-xl border-2 border-transparent bg-gray-700 hover:border-pink-300 hover:bg-gray-600 transition-all aspect-square"
            title={s.label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.src}
              alt={s.label}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* 직접 업로드 */}
      <button
        onClick={handleUpload}
        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-colors"
      >
        + 직접 업로드
      </button>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        스티커를 탭해 추가 · 드래그로 이동 · ↻로 회전 · 핑크 핸들로 크기 조절
      </p>
    </div>
  )
}
