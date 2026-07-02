'use client'

import { useState } from 'react'
import { toCanvas } from 'html-to-image'
import { useEditorStore, STRIP_DIMENSIONS, FRAME_DUPLICATES } from '@entities/frame'

interface Props {
  canvasRef: React.RefObject<HTMLDivElement | null>
  rightCanvasRef?: React.RefObject<HTMLDivElement | null>
  variant?: 'sidebar' | 'mobile'
}

const imgToDataUrl = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })

const prepareAndCapture = async (el: HTMLDivElement, sw: number, sh: number): Promise<HTMLCanvasElement> => {
  // blob: URL → data URL 사전 변환
  const imgs = Array.from(el.querySelectorAll('img'))
  const origSrcs = imgs.map((img) => img.getAttribute('src') ?? '')
  await Promise.all(
    imgs.map(async (img, i) => {
      const src = origSrcs[i]
      if (!src) return
      try { img.src = await imgToDataUrl(src) } catch { /* 원본 유지 */ }
    })
  )

  // 힌트 텍스트 숨기기
  const hints = Array.from(el.querySelectorAll<HTMLElement>('[data-download-hide]'))
  hints.forEach((h) => { h.style.visibility = 'hidden' })

  // transform 제거 후 캡처
  const origTransform = el.style.transform
  const origOrigin = el.style.transformOrigin
  el.style.transform = 'none'
  el.style.transformOrigin = 'top left'
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

  let captured: HTMLCanvasElement
  try {
    captured = await toCanvas(el, { pixelRatio: 1, width: sw, height: sh, skipFonts: true })
  } finally {
    el.style.transform = origTransform
    el.style.transformOrigin = origOrigin
    imgs.forEach((img, i) => { if (origSrcs[i]) img.src = origSrcs[i] })
    hints.forEach((h) => { h.style.visibility = '' })
  }
  return captured
}

export const DownloadButton = ({ canvasRef, rightCanvasRef, variant = 'sidebar' }: Props) => {
  const frameType = useEditorStore((s) => s.frameType)
  const setSelectedTextId = useEditorStore((s) => s.actions.setSelectedTextId)
  const setSelectedStickerId = useEditorStore((s) => s.actions.setSelectedStickerId)
  const [loading, setLoading] = useState(false)

  const { width: sw, height: sh } = STRIP_DIMENSIONS[frameType]
  const isDuplicated = FRAME_DUPLICATES[frameType] === 2

  const handleDownload = async () => {
    if (!canvasRef.current || loading) return
    setLoading(true)

    setSelectedTextId(null)
    setSelectedStickerId(null)
    await new Promise((r) => setTimeout(r, 80))

    try {
      let output: HTMLCanvasElement

      if (isDuplicated && rightCanvasRef?.current) {
        // A/B: 왼쪽·오른쪽 각각 캡처 → 2000×3000으로 합치기
        const [leftCanvas, rightCanvas] = await Promise.all([
          prepareAndCapture(canvasRef.current, sw, sh),
          prepareAndCapture(rightCanvasRef.current, sw, sh),
        ])
        output = document.createElement('canvas')
        output.width = sw * 2
        output.height = sh
        const ctx = output.getContext('2d')!
        ctx.drawImage(leftCanvas, 0, 0)
        ctx.drawImage(rightCanvas, sw, 0)
      } else {
        // C type 또는 단일 strip
        output = await prepareAndCapture(canvasRef.current, sw, sh)
      }

      output.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cutkku_${frameType}_${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    } catch (err) {
      console.error('다운로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 text-pink-500 disabled:opacity-50 transition-opacity"
      >
        <span className="text-base leading-none">↓</span>
        <span className="text-[10px] leading-none">{loading ? '...' : '저장'}</span>
      </button>
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
