'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore, STRIP_DIMENSIONS, STRIP_PREVIEW_SIZE, FRAME_DUPLICATES } from '@entities/frame'
import { StripContent } from '@features/frame-layout'
import { StripWrapper } from './strip-wrapper'
import { TextLayerItem } from './text-layer-item'
import { StickerLayerItem } from './sticker-layer-item'

const MD_BREAKPOINT = 768
const CANVAS_PADDING = 32

interface FrameCanvasProps {
  canvasRef?: React.RefObject<HTMLDivElement | null>
  rightCanvasRef?: React.RefObject<HTMLDivElement | null>
}

export const FrameCanvas = ({ canvasRef, rightCanvasRef }: FrameCanvasProps) => {
  const internalRef = useRef<HTMLDivElement>(null)
  const internalRightRef = useRef<HTMLDivElement>(null)
  const ref = canvasRef ?? internalRef
  const rRef = rightCanvasRef ?? internalRightRef

  const [isMobile, setIsMobile] = useState(false)
  const [mobileVW, setMobileVW] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_BREAKPOINT - 1}px)`)
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) setMobileVW(window.innerWidth)
    }
    update(mq)
    window.addEventListener('resize', () => {
      if (mq.matches) setMobileVW(window.innerWidth)
    })
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const frameType = useEditorStore((s) => s.frameType)
  const backgroundColor = useEditorStore((s) => s.backgroundColor)
  const slots = useEditorStore((s) => s.slots)
  const texts = useEditorStore((s) => s.texts)
  const stickers = useEditorStore((s) => s.stickers)
  const setSelectedTextId = useEditorStore((s) => s.actions.setSelectedTextId)
  const setSelectedStickerId = useEditorStore((s) => s.actions.setSelectedStickerId)

  const handleCanvasClick = () => {
    setSelectedTextId(null)
    setSelectedStickerId(null)
  }

  const isDuplicated = FRAME_DUPLICATES[frameType] === 2
  const { width: sw, height: sh } = STRIP_DIMENSIONS[frameType]
  const { width: fixedPw, height: fixedPh } = STRIP_PREVIEW_SIZE[frameType]
  const stripCount = isDuplicated ? 2 : 1

  const scale = isMobile
    ? (mobileVW - CANVAS_PADDING) / (sw * stripCount)
    : fixedPw / sw

  const pw = isMobile ? Math.round(sw * scale) : fixedPw
  const ph = isMobile ? Math.round(sh * scale) : fixedPh
  const totalPreviewWidth = pw * stripCount

  const stripStyle: React.CSSProperties = {
    width: sw,
    height: sh,
    backgroundColor,
    transform: `scale(${scale})`,
  }

  // 왼쪽 strip: 텍스트·스티커 모두 interactive
  const leftLayers = (
    <>
      {texts.map((t) => (
        <TextLayerItem key={t.id} text={t} scale={scale} canvasRef={ref} interactive />
      ))}
      {stickers.map((s) => (
        <StickerLayerItem key={s.id} sticker={s} scale={scale} interactive stripOffsetX={0} />
      ))}
    </>
  )

  // 오른쪽 strip (A/B):
  // - 텍스트: interactive={true}, 위치 공유(미러) — 어느 쪽에서 드래그해도 같이 이동
  // - 스티커: interactive={true}, stripOffsetX={sw} — 전체 2000px 캔버스 중 오른쪽 1000px 영역 표시
  const rightLayers = (
    <>
      {texts.map((t) => (
        <TextLayerItem key={`r-${t.id}`} text={t} scale={scale} canvasRef={ref} interactive />
      ))}
      {stickers.map((s) => (
        <StickerLayerItem key={`r-${s.id}`} sticker={s} scale={scale} interactive stripOffsetX={sw} />
      ))}
    </>
  )

  if (!isMobile && scale === 0) return null

  return (
    <div className="w-full flex justify-center">
      <div style={{ width: totalPreviewWidth, height: ph }} className="relative flex shrink-0">
        {/* 왼쪽: 편집 가능 strip */}
        <StripWrapper width={pw} height={ph}>
          <div
            ref={ref}
            className="absolute top-0 left-0 origin-top-left overflow-hidden shadow-xl"
            style={stripStyle}
            onClick={handleCanvasClick}
          >
            <StripContent type={frameType} slots={slots} backgroundColor={backgroundColor} interactive />
            {leftLayers}
          </div>
        </StripWrapper>

        {/* 오른쪽: A/B 전용 — 이미지 슬롯은 읽기 전용, 텍스트·스티커는 양방향 편집 */}
        {isDuplicated && (
          <StripWrapper width={pw} height={ph}>
            <div
              ref={rRef}
              className="absolute top-0 left-0 origin-top-left overflow-hidden shadow-xl"
              style={stripStyle}
              onClick={handleCanvasClick}
            >
              <StripContent type={frameType} slots={slots} backgroundColor={backgroundColor} interactive={false} />
              {rightLayers}
            </div>
          </StripWrapper>
        )}
      </div>
    </div>
  )
}
