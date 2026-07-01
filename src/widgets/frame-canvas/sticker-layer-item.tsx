"use client";

import { useRef } from "react";
import Image from "next/image";
import { useEditorStore } from "@entities/frame";
import type { StickerLayer } from "@entities/frame";

const BASE_SIZE = 120;

interface Props {
  sticker: StickerLayer;
  scale: number;
  interactive?: boolean;
}

export const StickerLayerItem = ({
  sticker,
  scale,
  interactive = true,
}: Props) => {
  const updateSticker = useEditorStore((s) => s.actions.updateSticker);
  const removeSticker = useEditorStore((s) => s.actions.removeSticker);
  const setSelectedStickerId = useEditorStore(
    (s) => s.actions.setSelectedStickerId
  );
  const isSelected = useEditorStore((s) => s.selectedStickerId === sticker.id);

  const size = BASE_SIZE * sticker.scale;
  const dragRef = useRef({ mouseX: 0, mouseY: 0, x: 0, y: 0 });
  const rotateRef = useRef({ initAngle: 0, initRotate: 0, cx: 0, cy: 0 });
  const scaleRef = useRef({ initDist: 0, initScale: 1, cx: 0, cy: 0 });

  const handleDragDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedStickerId(sticker.id);
    dragRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: sticker.x,
      y: sticker.y,
    };
    const onMove = (ev: PointerEvent) => {
      updateSticker(sticker.id, {
        x: Math.round(
          dragRef.current.x + (ev.clientX - dragRef.current.mouseX) / scale
        ),
        y: Math.round(
          dragRef.current.y + (ev.clientY - dragRef.current.mouseY) / scale
        ),
      });
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const handleRotateDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    // 스티커 중심 좌표 (screen space)
    const cx = (sticker.x + size / 2) * scale;
    const cy = (sticker.y + size / 2) * scale;
    const initAngle =
      Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    rotateRef.current = { initAngle, initRotate: sticker.rotate, cx, cy };
    const onMove = (ev: PointerEvent) => {
      const angle =
        Math.atan2(
          ev.clientY - rotateRef.current.cy,
          ev.clientX - rotateRef.current.cx
        ) *
        (180 / Math.PI);
      updateSticker(sticker.id, {
        rotate: Math.round(
          rotateRef.current.initRotate + angle - rotateRef.current.initAngle
        ),
      });
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  const handleScaleDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const cx = (sticker.x + size / 2) * scale;
    const cy = (sticker.y + size / 2) * scale;
    const initDist = Math.hypot(e.clientX - cx, e.clientY - cy);
    scaleRef.current = { initDist, initScale: sticker.scale, cx, cy };
    const onMove = (ev: PointerEvent) => {
      const dist = Math.hypot(
        ev.clientX - scaleRef.current.cx,
        ev.clientY - scaleRef.current.cy
      );
      const newScale = Math.max(
        0.2,
        Math.min(
          8,
          (scaleRef.current.initScale * dist) / scaleRef.current.initDist
        )
      );
      updateSticker(sticker.id, { scale: Math.round(newScale * 10) / 10 });
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  };

  return (
    <div
      className="absolute select-none"
      style={{
        left: sticker.x,
        top: sticker.y,
        width: size,
        height: size,
        transform: `rotate(${sticker.rotate}deg)`,
        transformOrigin: "center",
        touchAction: "none",
        cursor: interactive ? "grab" : "default",
      }}
      onPointerDown={interactive ? handleDragDown : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      <Image
        src={sticker.src}
        alt="sticker"
        fill
        className="object-contain"
        draggable={false}
        unoptimized
      />

      {isSelected && interactive && (
        <>
          <div className="absolute inset-0 border-2 border-dashed border-pink-400 rounded pointer-events-none" />
          {/* 삭제 */}
          <div
            className="absolute -top-4 -left-4 w-14 h-14 bg-red-500 text-white rounded-full text-lg flex items-center justify-center z-10 cursor-pointer"
            onPointerDown={(e) => {
              e.stopPropagation();
              removeSticker(sticker.id);
            }}
            style={{ touchAction: "none" }}
          >
            ✕
          </div>
          {/* 회전 */}
          <div
            className="absolute -top-4 -right-4 w-14 h-14 bg-blue-400 text-white rounded-full text-lg flex items-center justify-center z-10 cursor-grab"
            onPointerDown={handleRotateDown}
            style={{ touchAction: "none" }}
          >
            ↻
          </div>
          {/* 크기 */}
          <div
            className="absolute -bottom-4 -right-4 w-14 h-14 bg-pink-400 rounded-full z-10 cursor-se-resize"
            onPointerDown={handleScaleDown}
            style={{ touchAction: "none" }}
          />
        </>
      )}
    </div>
  );
};
