'use client'

import { useEditorStore } from '@entities/frame'

const PRESET_COLORS = [
  '#ffffff', '#f5f0eb', '#fce4ec', '#ffecd2',
  '#fffde7', '#e8f5e9', '#e3f2fd', '#f3e5f5',
  '#212121', '#424242', '#757575', '#bdbdbd',
  '#ef9a9a', '#f48fb1', '#ce93d8', '#90caf9',
]

export const BackgroundColorPicker = () => {
  const backgroundColor = useEditorStore((s) => s.backgroundColor)
  const setBackgroundColor = useEditorStore((s) => s.actions.setBackgroundColor)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">배경색</p>

      <div className="grid grid-cols-8 gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setBackgroundColor(color)}
            className={[
              'w-full aspect-square rounded-md border-2 transition-transform hover:scale-110',
              backgroundColor === color ? 'border-pink-400 scale-110' : 'border-gray-200',
            ].join(' ')}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">직접 선택</label>
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5"
        />
        <span className="text-xs text-gray-400 font-mono">{backgroundColor}</span>
      </div>
    </div>
  )
}
