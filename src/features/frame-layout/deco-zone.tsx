'use client'

interface DecoZoneProps {
  style: React.CSSProperties
  backgroundColor: string
}

export const DecoZone = ({ style, backgroundColor }: DecoZoneProps) => (
  <div
    style={{
      ...style,
      backgroundColor,
      borderTop: '3px solid rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <span style={{ fontSize: 28, color: 'rgba(0,0,0,0.15)', letterSpacing: 2, userSelect: 'none' }}>
      ✦ 텍스트 · 스티커 영역 ✦
    </span>
  </div>
)
