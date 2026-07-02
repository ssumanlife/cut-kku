'use client'

import { useState } from 'react'
import {
  useEditorStore,
  STRIP_DIMENSIONS,
  FRAME_DUPLICATES,
  FRAME_LAYOUT,
  type FrameType,
  type ImageSlot,
  type StickerLayer,
  type TextLayer,
} from '@entities/frame'
import { IMAGE_FILTER_STYLE } from '@shared/lib/image-filter'

interface Props {
  canvasRef?: React.RefObject<HTMLDivElement | null>
  rightCanvasRef?: React.RefObject<HTMLDivElement | null>
  variant?: 'sidebar' | 'mobile'
}

const STICKER_BASE_SIZE = 120
const C_SLOT_POSITIONS = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
]

const loadImg = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    if (!src) { resolve(null); return }
    const img = new window.Image()
    if (src.startsWith('http://') || src.startsWith('https://')) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    setTimeout(() => resolve(null), 8000)
    img.src = src
  })

const drawImageCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) => {
  const ir = img.naturalWidth / img.naturalHeight
  const cr = dw / dh
  let sx: number, sy: number, sw: number, sh: number
  if (ir > cr) {
    sh = img.naturalHeight; sw = sh * cr
    sx = (img.naturalWidth - sw) / 2; sy = 0
  } else {
    sw = img.naturalWidth; sh = sw / cr
    sx = 0; sy = (img.naturalHeight - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

const getSlotRect = (frameType: FrameType, i: number) => {
  if (frameType === 'C') {
    const l = FRAME_LAYOUT['C']
    const { col, row } = C_SLOT_POSITIONS[i] ?? { col: 0, row: 0 }
    return {
      left: l.paddingX + col * (l.photoWidth + l.colGap),
      top: l.paddingTop + row * (l.photoHeight + l.rowGap),
      width: l.photoWidth,
      height: l.photoHeight,
    }
  }
  const l = FRAME_LAYOUT[frameType as 'A' | 'B']
  return {
    left: l.paddingX,
    top: l.paddingTop + i * (l.photoHeight + l.gap),
    width: l.photoWidth,
    height: l.photoHeight,
  }
}

const drawLogo = (
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  sw: number,
  sh: number,
  paddingX: number,
  paddingTop: number,
) => {
  const topFontSize = Math.round(paddingTop * 0.8)
  const sideFontSize = Math.round(paddingX * 0.5)
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.75)'
  ctx.textBaseline = 'middle'

  // 상단 수평 로고
  ctx.font = `700 ${topFontSize}px "Arial Black", Arial`
  ctx.textAlign = 'left'
  ctx.fillText('CUTKKU', offsetX + paddingX, 16 + paddingTop / 2)

  // 우측 수직 로고 (2/6.7 지점)
  ctx.font = `700 ${sideFontSize}px "Arial Black", Arial`
  ctx.textAlign = 'center'
  const rightLogoTop = Math.round((sh * 2) / 6.7)
  ctx.translate(offsetX + sw - paddingX / 2, rightLogoTop)
  ctx.rotate(Math.PI / 2)
  ctx.fillText('CUTKKU', 0, 0)
  ctx.restore()
}

const renderToCanvas = async (
  frameType: FrameType,
  backgroundColor: string,
  filterKey: string,
  slots: ImageSlot[],
  stickers: StickerLayer[],
  texts: TextLayer[],
): Promise<HTMLCanvasElement> => {
  const { width: sw, height: sh } = STRIP_DIMENSIONS[frameType]
  const isDuplicated = FRAME_DUPLICATES[frameType] === 2
  const totalWidth = isDuplicated ? sw * 2 : sw
  const layout = FRAME_LAYOUT[frameType]
  const { paddingX, paddingTop } = layout

  const canvas = document.createElement('canvas')
  canvas.width = totalWidth
  canvas.height = sh
  const ctx = canvas.getContext('2d')!

  // drop-shadow는 canvas에서 제거 (다른 필터는 그대로 지원)
  const canvasFilter = (IMAGE_FILTER_STYLE[filterKey as keyof typeof IMAGE_FILTER_STYLE] ?? 'none')
    .replace(/drop-shadow\([^)]*\)/g, '').trim() || 'none'

  // 슬롯 이미지 로드 (병렬)
  const slotImgs = await Promise.all(slots.map((s) => (s.imageUrl ? loadImg(s.imageUrl) : Promise.resolve(null))))
  // 스티커 이미지 로드 (병렬)
  const stickerImgs = await Promise.all(stickers.map((s) => loadImg(s.src)))

  await document.fonts.ready

  const drawStrip = (offsetX: number) => {
    // 1. 배경
    ctx.fillStyle = backgroundColor
    ctx.fillRect(offsetX, 0, sw, sh)

    // 2. 사진 슬롯
    for (let i = 0; i < slots.length; i++) {
      const img = slotImgs[i]
      if (!img) continue
      const { left, top, width, height } = getSlotRect(frameType, i)
      ctx.filter = canvasFilter
      drawImageCover(ctx, img, offsetX + left, top, width, height)
      ctx.filter = 'none'
    }

    // 3. CUTKKU 로고
    drawLogo(ctx, offsetX, sw, sh, paddingX, paddingTop)
  }

  drawStrip(0)
  if (isDuplicated) drawStrip(sw)

  // 4. 스티커 (A/B: 전체 2000px 좌표계 그대로)
  for (let i = 0; i < stickers.length; i++) {
    const s = stickers[i]
    const img = stickerImgs[i]
    if (!img) continue
    const size = STICKER_BASE_SIZE * s.scale
    const cx = s.x + size / 2
    const cy = s.y + size / 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((s.rotate * Math.PI) / 180)
    ctx.drawImage(img, -size / 2, -size / 2, size, size)
    ctx.restore()
  }

  // 5. 텍스트 (A/B: 양쪽 스트립에 동일하게)
  const drawTexts = (offsetX: number) => {
    for (const t of texts) {
      ctx.save()
      ctx.font = `${t.fontSize}px ${t.font}`
      ctx.fillStyle = t.color
      ctx.textBaseline = 'top'
      ctx.fillText(t.content, offsetX + t.x, t.y)
      ctx.restore()
    }
  }

  drawTexts(0)
  if (isDuplicated) drawTexts(sw)

  return canvas
}

export const DownloadButton = ({ variant = 'sidebar' }: Props) => {
  const frameType = useEditorStore((s) => s.frameType)
  const backgroundColor = useEditorStore((s) => s.backgroundColor)
  const frameFilter = useEditorStore((s) => s.frameFilter)
  const slots = useEditorStore((s) => s.slots)
  const texts = useEditorStore((s) => s.texts)
  const stickers = useEditorStore((s) => s.stickers)
  const setSelectedTextId = useEditorStore((s) => s.actions.setSelectedTextId)
  const setSelectedStickerId = useEditorStore((s) => s.actions.setSelectedStickerId)
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (loading) return
    setLoading(true)
    setSelectedTextId(null)
    setSelectedStickerId(null)

    try {
      const output = await renderToCanvas(
        frameType, backgroundColor, frameFilter, slots, stickers, texts,
      )

      await new Promise<void>((resolve) => {
        output.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cutkku_${frameType}_${Date.now()}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
          resolve()
        }, 'image/png')
      })
      // 로딩 오버레이 최소 2초 노출
      await new Promise((r) => setTimeout(r, 2000))
    } catch (err) {
      console.error('다운로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'mobile') {
    return (
      <>
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl px-10 py-7 flex flex-col items-center gap-3 shadow-xl">
              <div className="w-9 h-9 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-gray-700">저장 중...</p>
              <p className="text-xs text-gray-400">잠시만 기다려주세요</p>
            </div>
          </div>
        )}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 text-pink-500 disabled:opacity-50 transition-opacity"
        >
          <span className="text-base leading-none">↓</span>
          <span className="text-[10px] leading-none">저장</span>
        </button>
      </>
    )
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full py-3 bg-pink-400 hover:bg-pink-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
    >
      {loading ? '저장 중...' : '다운로드 PNG'}
    </button>
  )
}
