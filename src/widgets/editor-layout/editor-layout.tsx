'use client'

import { useRef } from 'react'
import { FrameCanvas } from '@widgets/frame-canvas'
import { FrameTypeSelector } from '@features/frame-type-selector'
import { useEditorStore } from '@entities/frame'

const CANVAS_HINT: Record<string, string> = {
  A: '왼쪽 스트립을 클릭해 편집하세요 · 오른쪽은 자동으로 복제됩니다',
  B: '왼쪽 스트립을 클릭해 편집하세요 · 오른쪽은 자동으로 복제됩니다',
  C: '각 슬롯을 클릭해 사진을 추가하세요',
}

export const EditorLayout = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const frameType = useEditorStore((s) => s.frameType)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-72 min-w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-pink-500">✂ 컷꾸</h1>
          <p className="text-xs text-gray-400 mt-0.5">나만의 포토부스 프레임 꾸미기</p>
        </div>

        <div className="flex flex-col gap-5 p-4 flex-1">
          <FrameTypeSelector />

          <div id="panel-background-color" />
          <div id="panel-filter" />
          <div id="panel-text" />
          <div id="panel-sticker" />
        </div>

        <div className="p-4 border-t border-gray-100">
          <div id="panel-download" />
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center bg-[#f5f0eb] overflow-auto p-6">
        <div className="flex flex-col items-center gap-4">
          <FrameCanvas canvasRef={canvasRef} />
          <p className="text-xs text-gray-400">{CANVAS_HINT[frameType]}</p>
        </div>
      </main>
    </div>
  )
}
