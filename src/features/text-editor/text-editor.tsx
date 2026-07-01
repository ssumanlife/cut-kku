'use client'

import { useState } from 'react'
import { useEditorStore } from '@entities/frame'
import { STRIP_DIMENSIONS } from '@entities/frame'

const FONT_OPTIONS = [
  { label: '기본체', value: 'system-ui, sans-serif' },
  { label: '나눔고딕', value: "'Nanum Gothic', sans-serif" },
  { label: '나눔명조', value: "'Nanum Myeongjo', serif" },
  { label: '도현체', value: "'Do Hyeon', sans-serif" },
  { label: '블랙한산스', value: "'Black Han Sans', sans-serif" },
]

const TEXT_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#3b82f6', '#a855f7',
  '#ec4899', '#6b7280',
]

export const TextEditor = () => {
  const frameType = useEditorStore((s) => s.frameType)
  const texts = useEditorStore((s) => s.texts)
  const selectedTextId = useEditorStore((s) => s.selectedTextId)
  const addText = useEditorStore((s) => s.actions.addText)
  const updateText = useEditorStore((s) => s.actions.updateText)
  const removeText = useEditorStore((s) => s.actions.removeText)
  const setSelectedTextId = useEditorStore((s) => s.actions.setSelectedTextId)

  const [draft, setDraft] = useState({
    content: '',
    font: FONT_OPTIONS[0].value,
    fontSize: 80,
    color: '#000000',
  })

  const selected = texts.find((t) => t.id === selectedTextId)

  const handleAdd = () => {
    if (!draft.content.trim()) return
    const { width, height } = STRIP_DIMENSIONS[frameType]
    addText({
      content: draft.content,
      font: draft.font,
      fontSize: draft.fontSize,
      color: draft.color,
      x: Math.round(width / 2 - 100),
      y: Math.round(height / 2),
    })
    setDraft((prev) => ({ ...prev, content: '' }))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">텍스트</p>

      {/* 텍스트 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft.content}
          onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="텍스트 입력..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pink-300"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-pink-400 text-white text-sm rounded-lg hover:bg-pink-500 transition-colors shrink-0"
        >
          추가
        </button>
      </div>

      {/* 폰트 선택 */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] text-gray-400">폰트</p>
        <div className="flex flex-wrap gap-1">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setDraft((p) => ({ ...p, font: f.value }))
                if (selected) updateText(selected.id, { font: f.value })
              }}
              className={[
                'px-2 py-1 text-xs rounded-md border transition-colors',
                draft.font === f.value
                  ? 'border-pink-400 bg-pink-50 text-pink-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300',
              ].join(' ')}
              style={{ fontFamily: f.value }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 크기 조절 */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] text-gray-400">크기 ({draft.fontSize}px)</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const v = Math.max(20, draft.fontSize - 10)
              setDraft((p) => ({ ...p, fontSize: v }))
              if (selected) updateText(selected.id, { fontSize: v })
            }}
            className="w-7 h-7 rounded-md border border-gray-200 text-gray-600 text-sm hover:border-gray-300"
          >−</button>
          <input
            type="range"
            min={20}
            max={300}
            step={10}
            value={draft.fontSize}
            onChange={(e) => {
              const v = Number(e.target.value)
              setDraft((p) => ({ ...p, fontSize: v }))
              if (selected) updateText(selected.id, { fontSize: v })
            }}
            className="flex-1 accent-pink-400"
          />
          <button
            onClick={() => {
              const v = Math.min(300, draft.fontSize + 10)
              setDraft((p) => ({ ...p, fontSize: v }))
              if (selected) updateText(selected.id, { fontSize: v })
            }}
            className="w-7 h-7 rounded-md border border-gray-200 text-gray-600 text-sm hover:border-gray-300"
          >+</button>
        </div>
      </div>

      {/* 색상 선택 */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] text-gray-400">색상</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setDraft((p) => ({ ...p, color: c }))
                if (selected) updateText(selected.id, { color: c })
              }}
              className={[
                'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
                draft.color === c ? 'border-pink-400 scale-110' : 'border-gray-200',
              ].join(' ')}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={draft.color}
            onChange={(e) => {
              setDraft((p) => ({ ...p, color: e.target.value }))
              if (selected) updateText(selected.id, { color: e.target.value })
            }}
            className="w-6 h-6 rounded-full cursor-pointer border border-gray-200 p-0"
          />
        </div>
      </div>

      {/* 추가된 텍스트 목록 */}
      {texts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] text-gray-400">추가된 텍스트</p>
          <div className="flex flex-col gap-1">
            {texts.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTextId(t.id === selectedTextId ? null : t.id)}
                className={[
                  'flex items-center justify-between px-2 py-1.5 rounded-lg border cursor-pointer transition-colors',
                  t.id === selectedTextId
                    ? 'border-pink-300 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <span
                  className="text-sm truncate flex-1"
                  style={{ fontFamily: t.font, color: t.color }}
                >
                  {t.content}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeText(t.id) }}
                  className="text-gray-400 hover:text-red-400 ml-2 text-xs shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
