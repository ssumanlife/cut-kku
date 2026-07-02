'use client'

import { useState } from 'react'
import { toCanvas } from 'html-to-image'
import { useEditorStore, STRIP_DIMENSIONS, FRAME_DUPLICATES } from '@entities/frame'

interface Props {
  canvasRef: React.RefObject<HTMLDivElement | null>
  rightCanvasRef?: React.RefObject<HTMLDivElement | null>
  variant?: 'sidebar' | 'mobile'
}

const imgToDataUrl = (src: string): Promise<string> => {
  if (src.startsWith('data:')) return Promise.resolve(src)
  return new Promise((resolve) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}

const waitFrames = (n: number): Promise<void> =>
  new Promise((resolve) => {
    let count = 0
    const tick = () => { if (++count >= n) resolve(); else requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  })

const prepareAndCapture = async (el: HTMLDivElement, sw: number, sh: number): Promise<HTMLCanvasElement> => {
  // 1. blob/http 이미지 → dataURL 변환 후 로드 완료 대기
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'))
  const origSrcs = imgs.map((img) => img.src)

  await Promise.all(
    imgs.map(async (img, i) => {
      const src = origSrcs[i]
      if (!src) return
      const dataUrl = await imgToDataUrl(src)
      img.src = dataUrl
      if (!img.complete) {
        await new Promise<void>((r) => {
          img.onload = () => r()
          img.onerror = () => r()
        })
      }
    })
  )

  // 2. 힌트 텍스트 숨기기
  const hints = Array.from(el.querySelectorAll<HTMLElement>('[data-download-hide]'))
  hints.forEach((h) => { h.style.visibility = 'hidden' })

  // 3. transform 제거
  const origTransform = el.style.transform
  const origOrigin = el.style.transformOrigin
  el.style.transform = 'none'
  el.style.transformOrigin = 'top left'

  // 4. 모바일 렌더 반영 대기 (충분한 프레임 확보)
  await waitFrames(6)

  let captured: HTMLCanvasElement
  try {
    captured = await toCanvas(el, {
      pixelRatio: 1,
      width: sw,
      height: sh,
      skipFonts: true,
      cacheBust: true,
    })
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
    // 선택 해제 후 UI 반영 대기
    await waitFrames(4)

    try {
      let output: HTMLCanvasElement

      if (isDuplicated && rightCanvasRef?.current) {
        // A/B: 순차 캡처 — DOM 동시 수정 충돌 방지
        const leftCanvas = await prepareAndCapture(canvasRef.current, sw, sh)
        const rightCanvas = await prepareAndCapture(rightCanvasRef.current, sw, sh)
        output = document.createElement('canvas')
        output.width = sw * 2
        output.height = sh
        const ctx = output.getContext('2d')!
        ctx.drawImage(leftCanvas, 0, 0)
        ctx.drawImage(rightCanvas, sw, 0)
      } else {
        output = await prepareAndCapture(canvasRef.current, sw, sh)
      }

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
      // 로딩 오버레이가 최소 2초 노출되도록 대기
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
