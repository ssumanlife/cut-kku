'use client'

import { useState } from 'react'
import { toCanvas } from 'html-to-image'
import { useEditorStore, STRIP_DIMENSIONS, FRAME_DUPLICATES } from '@entities/frame'

interface Props {
  canvasRef: React.RefObject<HTMLDivElement | null>
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

export const DownloadButton = ({ canvasRef, variant = 'sidebar' }: Props) => {
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

    const el = canvasRef.current
    const imgs = Array.from(el.querySelectorAll('img'))
    const origSrcs = imgs.map((img) => img.getAttribute('src') ?? '')

    // blob: URL → data URL로 사전 변환 (html-to-image가 blob을 못 읽는 문제 해결)
    await Promise.all(
      imgs.map(async (img, i) => {
        const src = origSrcs[i]
        if (!src) return
        try {
          img.src = await imgToDataUrl(src)
        } catch {
          // 변환 실패 시 원본 유지
        }
      })
    )

    // transform: scale(n) 을 잠시 제거해야 html-to-image가 원본 해상도로 캡처함
    const origTransform = el.style.transform
    const origTransformOrigin = el.style.transformOrigin
    el.style.transform = 'none'
    el.style.transformOrigin = 'top left'
    // 두 프레임 기다려 레이아웃 재계산 완료 후 캡처
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

    try {
      const captured = await toCanvas(el, {
        pixelRatio: 1,
        width: sw,
        height: sh,
        skipFonts: true,
      })

      let output: HTMLCanvasElement

      if (isDuplicated) {
        output = document.createElement('canvas')
        output.width = sw * 2
        output.height = sh
        const ctx = output.getContext('2d')!
        ctx.drawImage(captured, 0, 0)
        ctx.drawImage(captured, sw, 0)
      } else {
        output = captured
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
      // transform 복원
      el.style.transform = origTransform
      el.style.transformOrigin = origTransformOrigin
      // 원본 src 복원
      imgs.forEach((img, i) => {
        if (origSrcs[i]) img.src = origSrcs[i]
      })
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
