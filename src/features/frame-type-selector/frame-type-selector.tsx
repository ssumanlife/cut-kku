'use client'

import { useEditorStore } from '@entities/frame'
import type { FrameType } from '@entities/frame'

const FRAME_OPTIONS: { type: FrameType; label: string; desc: string; preview: string }[] = [
  { type: 'A', label: 'Type A', desc: '4컷 세로', preview: '4:3 × 4' },
  { type: 'B', label: 'Type B', desc: '3컷 정방형', preview: '1:1 × 3' },
  { type: 'C', label: 'Type C', desc: '4컷 2×2', preview: '2행 2열' },
]

export const FrameTypeSelector = () => {
  const frameType = useEditorStore((s) => s.frameType)
  const setFrameType = useEditorStore((s) => s.actions.setFrameType)

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">프레임 타입</p>
      <div className="flex gap-2">
        {FRAME_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => setFrameType(opt.type)}
            className={[
              'flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all',
              frameType === opt.type
                ? 'border-pink-400 bg-pink-50 text-pink-600'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
            ].join(' ')}
          >
            <FramePreviewIcon type={opt.type} active={frameType === opt.type} />
            <span className="text-xs font-bold">{opt.label}</span>
            <span className="text-[10px]">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const FramePreviewIcon = ({ type, active }: { type: FrameType; active: boolean }) => {
  const color = active ? '#f472b6' : '#d1d5db'

  if (type === 'A') {
    return (
      <svg width="32" height="40" viewBox="0 0 32 40">
        {[0, 10, 20, 30].map((y) => (
          <rect key={y} x="2" y={y} width="28" height="8" rx="1" fill={color} />
        ))}
      </svg>
    )
  }
  if (type === 'B') {
    return (
      <svg width="32" height="40" viewBox="0 0 32 40">
        {[0, 14, 28].map((y) => (
          <rect key={y} x="2" y={y} width="28" height="10" rx="1" fill={color} />
        ))}
      </svg>
    )
  }
  return (
    <svg width="32" height="40" viewBox="0 0 32 40">
      {[
        [0, 0], [17, 0],
        [0, 21], [17, 21],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 2} y={y} width="13" height="19" rx="1" fill={color} />
      ))}
    </svg>
  )
}
