'use client'

import { useRef } from 'react'
import { useEditorStore } from '@entities/frame'
import type { TextLayer } from '@entities/frame'

interface TextLayerItemProps {
  text: TextLayer
  scale: number
  canvasRef: React.RefObject<HTMLDivElement | null>
}

export const TextLayerItem = ({ text, scale, canvasRef }: TextLayerItemProps) => {
  const updateText = useEditorStore((s) => s.actions.updateText)
  const setSelectedTextId = useEditorStore((s) => s.actions.setSelectedTextId)
  const selectedTextId = useEditorStore((s) => s.selectedTextId)
  const isSelected = selectedTextId === text.id

  const startRef = useRef({ mouseX: 0, mouseY: 0, textX: 0, textY: 0 })

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    setSelectedTextId(text.id)

    startRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      textX: text.x,
      textY: text.y,
    }

    const handleMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startRef.current.mouseX) / scale
      const dy = (ev.clientY - startRef.current.mouseY) / scale
      updateText(text.id, {
        x: Math.round(startRef.current.textX + dx),
        y: Math.round(startRef.current.textY + dy),
      })
    }

    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
    }

    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
  }

  return (
    <div
      className="absolute select-none whitespace-pre"
      style={{
        left: text.x,
        top: text.y,
        fontFamily: text.font,
        fontSize: text.fontSize,
        color: text.color,
        cursor: 'grab',
        outline: isSelected ? '2px dashed rgba(236,72,153,0.5)' : 'none',
        padding: '2px 4px',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
    >
      {text.content}
    </div>
  )
}
