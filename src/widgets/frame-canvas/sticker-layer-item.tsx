'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useEditorStore } from '@entities/frame'
import type { StickerLayer } from '@entities/frame'

const BASE_SIZE = 120

interface Props {
  sticker: StickerLayer
  scale: number
  interactive?: boolean
  stripOffsetX?: number
}

export const StickerLayerItem = ({
  sticker,
  scale,
  interactive = true,
  stripOffsetX = 0,
}: Props) => {
  const updateSticker = useEditorStore((s) => s.actions.updateSticker)
  const removeSticker = useEditorStore((s) => s.actions.removeSticker)
  const setSelectedStickerId = useEditorStore((s) => s.actions.setSelectedStickerId)
  const isSelected = useEditorStore((s) => s.selectedStickerId === sticker.id)

  const size = BASE_SIZE * sticker.scale
  const stickerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0 })

  // 회전/크기 핸들의 중심점을 실제 화면 좌표로 계산 (stripOffsetX 무관)
  const getCenter = () => {
    const rect = stickerRef.current!.getBoundingClientRect()
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 }
  }

  const handleDragDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    setSelectedStickerId(sticker.id)
    dragRef.current = { mouseX: e.clientX, mouseY: e.clientY, x: sticker.x, y: sticker.y }
    const onMove = (ev: PointerEvent) => {
      updateSticker(sticker.id, {
        x: Math.round(dragRef.current.x + (ev.clientX - dragRef.current.mouseX) / scale),
        y: Math.round(dragRef.current.y + (ev.clientY - dragRef.current.mouseY) / scale),
      })
    }
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const handleRotateDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    const { cx, cy } = getCenter()
    const initAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
    const initRotate = sticker.rotate
    const onMove = (ev: PointerEvent) => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI)
      updateSticker(sticker.id, {
        rotate: Math.round(initRotate + angle - initAngle),
      })
    }
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const handleScaleDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    const { cx, cy } = getCenter()
    const initDist = Math.hypot(e.clientX - cx, e.clientY - cy)
    const initScale = sticker.scale
    const onMove = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy)
      const newScale = Math.max(0.2, Math.min(8, (initScale * dist) / initDist))
      updateSticker(sticker.id, { scale: Math.round(newScale * 10) / 10 })
    }
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  return (
    <div
      ref={stickerRef}
      className="absolute select-none z-10"
      style={{
        left: sticker.x - stripOffsetX,
        top: sticker.y,
        width: size,
        height: size,
        transform: `rotate(${sticker.rotate}deg)`,
        transformOrigin: 'center',
        touchAction: 'none',
        cursor: interactive ? 'grab' : 'default',
      }}
      onPointerDown={interactive ? handleDragDown : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      <Image
        src={sticker.src}
        alt="sticker"
        fill
        className="object-contain"
        draggable={false}
        unoptimized
      />

      {isSelected && interactive && (
        <>
          <div className="absolute inset-0 border-2 border-dashed border-pink-400 rounded pointer-events-none" />
          <div
            className="absolute -top-4 -left-4 w-14 h-14 bg-red-500 text-white rounded-full text-lg flex items-center justify-center z-10 cursor-pointer"
            onPointerDown={(e) => { e.stopPropagation(); removeSticker(sticker.id) }}
            style={{ touchAction: 'none' }}
          >✕</div>
          <div
            className="absolute -top-4 -right-4 w-14 h-14 bg-blue-400 text-white rounded-full text-lg flex items-center justify-center z-10 cursor-grab"
            onPointerDown={handleRotateDown}
            style={{ touchAction: 'none' }}
          >↻</div>
          <div
            className="absolute -bottom-4 -right-4 w-14 h-14 bg-pink-400 rounded-full z-10 cursor-se-resize"
            onPointerDown={handleScaleDown}
            style={{ touchAction: 'none' }}
          />
        </>
      )}
    </div>
  )
}
