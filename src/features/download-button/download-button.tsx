'use client'

import { useState } from 'react'
import { toCanvas } from 'html-to-image'
import { useEditorStore, STRIP_DIMENSIONS, FRAME_DUPLICATES } from '@entities/frame'

interface Props {
  canvasRef: React.RefObject<HTMLDivElement | null>
  rightCanvasRef?: React.RefObject<HTMLDivElement | null>
  variant?: 'sidebar' | 'mobile'
}

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Nanum+Gothic&family=Nanum+Myeongjo&family=Do+Hyeon&family=Black+Han+Sans&display=swap'

let fontEmbedCSSCache: string | null = null

const loadFontEmbedCSS = async (): Promise<string> => {
  if (fontEmbedCSSCache) return fontEmbedCSSCache
  try {
    const cssResp = await fetch(GOOGLE_FONTS_URL)
    let css = await cssResp.text()
    const urlMatches = [...css.matchAll(/url\(([^)]+)\)/g)]
    await Promise.all(
      urlMatches.map(async ([fullMatch, rawUrl]) => {
        const url = rawUrl.replace(/['"]/g, '')
        try {
          const fontResp = await fetch(url)
          const blob = await fontResp.blob()
          const base64 = await new Promise<string>((r) => {
            const reader = new FileReader()
            reader.onload = () => r(reader.result as string)
            reader.readAsDataURL(blob)
          })
          css = css.replace(fullMatch, `url(${base64})`)
        } catch { /* skip */ }
      })
    )
    fontEmbedCSSCache = css
    return css
  } catch {
    return ''
  }
}

// blob URL에는 crossOrigin 설정 금지 (모바일 Safari 로드 차단)
const imgToDataUrl = (src: string): Promise<string> => {
  if (src.startsWith('data:')) return Promise.resolve(src)
  return new Promise((resolve) => {
    const img = new window.Image()
    if (!src.startsWith('blob:')) img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        c.getContext('2d')!.drawImage(img, 0, 0)
        resolve(c.toDataURL('image/png'))
      } catch {
        resolve(src)
      }
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

const prepareAndCapture = async (
  el: HTMLDivElement,
  sw: number,
  sh: number,
  fontEmbedCSS: string,
): Promise<HTMLCanvasElement> => {
  // 1. 원본 요소의 img를 모두 dataURL로 변환 (blob URL 포함)
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
          const done = () => r()
          img.onload = done
          img.onerror = done
          setTimeout(done, 3000) // 최대 3초 대기
        })
      }
    })
  )

  // 2. 힌트 숨기기
  const hints = Array.from(el.querySelectorAll<HTMLElement>('[data-download-hide]'))
  hints.forEach((h) => { h.style.visibility = 'hidden' })

  // 3. 클론을 body에 position:fixed로 붙여 모바일 뷰포트 안에서 full-size 렌더링
  //    (원본이 position:absolute + scale 상태면 모바일에서 클립되어 캡처 불완전)
  const clone = el.cloneNode(true) as HTMLDivElement
  Object.assign(clone.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: `${sw}px`,
    height: `${sh}px`,
    transform: 'none',
    transformOrigin: 'top left',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '99999',
    overflow: 'hidden',
  })
  document.body.appendChild(clone)

  await waitFrames(8)

  let captured: HTMLCanvasElement
  try {
    captured = await toCanvas(clone, {
      pixelRatio: 1,
      width: sw,
      height: sh,
      skipFonts: true,
      fontEmbedCSS,
      cacheBust: false,
    })
  } finally {
    document.body.removeChild(clone)
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
    await waitFrames(4)

    try {
      const fontEmbedCSS = await loadFontEmbedCSS()
      let output: HTMLCanvasElement

      if (isDuplicated && rightCanvasRef?.current) {
        // 순차 캡처 — DOM 동시 수정 충돌 방지
        const leftCanvas = await prepareAndCapture(canvasRef.current, sw, sh, fontEmbedCSS)
        const rightCanvas = await prepareAndCapture(rightCanvasRef.current, sw, sh, fontEmbedCSS)
        output = document.createElement('canvas')
        output.width = sw * 2
        output.height = sh
        const ctx = output.getContext('2d')!
        ctx.drawImage(leftCanvas, 0, 0)
        ctx.drawImage(rightCanvas, sw, 0)
      } else {
        output = await prepareAndCapture(canvasRef.current, sw, sh, fontEmbedCSS)
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
