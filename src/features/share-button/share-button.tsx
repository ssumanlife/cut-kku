'use client'

import { useState } from 'react'

const SHARE_URL = 'https://cut-kku.vercel.app'
const SHARE_TITLE = '컷꾸 | 나만의 포토부스 프레임 꾸미기'
const SHARE_TEXT = '포토부스 사진에 스티커·텍스트·필터를 더해 나만의 프레임을 만들어보세요!'

interface Props {
  variant?: 'sidebar' | 'mobile'
}

export const ShareButton = ({ variant = 'sidebar' }: Props) => {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL })
        return
      } catch {
        // 취소 또는 미지원 → fallback
      }
    }
    // fallback: 클립보드 복사
    try {
      await navigator.clipboard.writeText(SHARE_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('링크를 복사하세요:', SHARE_URL)
    }
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleShare}
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 text-gray-400 hover:text-pink-400 transition-colors"
      >
        <span className="text-base leading-none">↗</span>
        <span className="text-[10px] leading-none">{copied ? '복사됨' : '공유'}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className="w-full py-2 border border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-400 text-sm rounded-xl transition-colors"
    >
      {copied ? '링크 복사됨 ✓' : '사이트 공유하기 ↗'}
    </button>
  )
}
