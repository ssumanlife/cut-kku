interface FrameLogoProps {
  paddingTop: number;
  paddingX: number;
  decoHeight: number;
  totalHeight: number;
}

const LOGO_FONT: React.CSSProperties = {
  fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
  fontWeight: 700,
  letterSpacing: 0,
  color: "rgba(0,0,0,0.75)",
  userSelect: "none",
};

export const FrameLogo = ({
  paddingTop,
  paddingX,
  totalHeight,
}: FrameLogoProps) => {
  const fontSize = Math.round(paddingTop * 0.8);
  const sideFontSize = Math.round(paddingX * 0.5);
  const rightLogoTop = Math.round((totalHeight * 2) / 6.7);

  return (
    <>
      {/* 상단 수평 로고 — 좌측 정렬 */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 0,
          right: 0,
          height: paddingTop,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: paddingX,
          pointerEvents: "none",
        }}
      >
        <span style={{ ...LOGO_FONT, fontSize }}> CUTKKU</span>
      </div>

      {/* 우측 수직 로고 — 스트립 2/3 지점 */}
      <div
        style={{
          position: "absolute",
          right: 10,
          top: rightLogoTop,
          width: paddingX,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            ...LOGO_FONT,
            fontSize: sideFontSize,
            transform: "rotate(90deg)",
            whiteSpace: "nowrap",
          }}
        >
          CUTKKU
        </span>
      </div>
    </>
  );
};
