'use client'

import { useRef } from 'react'
import { useEditorStore, STRIP_DIMENSIONS, STRIP_PREVIEW_SIZE, FRAME_DUPLICATES } from '@entities/frame'
import { StripContent } from '@features/frame-layout'
import { StripWrapper } from './strip-wrapper'
import { TextLayerItem } from './text-layer-item'
import { StickerLayerItem } from './sticker-layer-item'

interface FrameCanvasProps {
  canvasRef?: React.RefObject<HTMLDivElement | null>
}

export const FrameCanvas = ({ canvasRef }: FrameCanvasProps) => {
  const internalRef = useRef<HTMLDivElement>(null)
  const ref = canvasRef ?? internalRef

  const frameType = useEditorStore((s) => s.frameType)
  const backgroundColor = useEditorStore((s) => s.backgroundColor)
  const slots = useEditorStore((s) => s.slots)
  const texts = useEditorStore((s) => s.texts)
  const stickers = useEditorStore((s) => s.stickers)

  const isDuplicated = FRAME_DUPLICATES[frameType] === 2
  const { width: sw, height: sh } = STRIP_DIMENSIONS[frameType]
  const { width: pw, height: ph } = STRIP_PREVIEW_SIZE[frameType]
  const scale = pw / sw
  const totalPreviewWidth = isDuplicated ? pw * 2 : pw

  const stripStyle: React.CSSProperties = {
    width: sw,
    height: sh,
    backgroundColor,
    transform: `scale(${scale})`,
  }

  const layers = (
    <>
      {texts.map((t) => <TextLayerItem key={t.id} text={t} />)}
      {stickers.map((s) => <StickerLayerItem key={s.id} sticker={s} />)}
    </>
  )

  return (
    <div style={{ width: totalPreviewWidth, height: ph }} className="relative flex shrink-0">
      {/* 왼쪽: 편집 가능 스트립 */}
      <StripWrapper width={pw} height={ph}>
        <div
          ref={ref}
          className="absolute top-0 left-0 origin-top-left overflow-hidden shadow-xl"
          style={stripStyle}
        >
          <StripContent type={frameType} slots={slots} backgroundColor={backgroundColor} interactive />
          {layers}
        </div>
      </StripWrapper>

      {/* 오른쪽: 읽기 전용 복제 스트립 (A/B 전용) */}
      {isDuplicated && (
        <StripWrapper width={pw} height={ph}>
          <div
            className="absolute top-0 left-0 origin-top-left overflow-hidden shadow-xl pointer-events-none"
            style={stripStyle}
          >
            <StripContent type={frameType} slots={slots} backgroundColor={backgroundColor} interactive={false} />
            {layers}
          </div>
          <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
            <span className="text-[10px] text-black/20 select-none">복제본</span>
          </div>
        </StripWrapper>
      )}
    </div>
  )
}
