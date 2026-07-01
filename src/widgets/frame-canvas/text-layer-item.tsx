import type { TextLayer } from '@entities/frame'

export const TextLayerItem = ({ text }: { text: TextLayer }) => (
  <div
    className="absolute select-none pointer-events-none whitespace-pre"
    style={{
      left: text.x,
      top: text.y,
      fontFamily: text.font,
      fontSize: text.fontSize,
      color: text.color,
    }}
  >
    {text.content}
  </div>
)
