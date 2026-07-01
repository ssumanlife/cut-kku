"use client";

import Image from "next/image";
import { useEditorStore, STRIP_DIMENSIONS } from "@entities/frame";
import { BUILTIN_STICKERS } from "@entities/sticker";

export const StickerPanel = () => {
  const frameType = useEditorStore((s) => s.frameType);
  const addSticker = useEditorStore((s) => s.actions.addSticker);

  const { width, height } = STRIP_DIMENSIONS[frameType];

  const handleAddBuiltin = (src: string) => {
    addSticker({
      src,
      x: Math.round(width / 2 - 60),
      y: Math.round(height / 2 - 60),
      rotate: 0,
      scale: 3,
    });
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const src = URL.createObjectURL(file);
      addSticker({
        src,
        x: Math.round(width / 2 - 60),
        y: Math.round(height / 2 - 60),
        rotate: 0,
        scale: 1,
      });
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        스티커
      </p>

      {/* 내장 스티커 */}
      <div className="grid grid-cols-5 gap-2">
        {BUILTIN_STICKERS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleAddBuiltin(s.src)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-transparent hover:border-pink-200 hover:bg-pink-50 transition-all"
            title={s.label}
          >
            <div className="relative w-10 h-10">
              <Image
                src={s.src}
                alt={s.label}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-[10px] text-gray-500">{s.label}</span>
          </button>
        ))}
      </div>

      {/* 직접 업로드 */}
      <button
        onClick={handleUpload}
        className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-pink-300 hover:text-pink-400 transition-colors"
      >
        + 직접 업로드
      </button>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        스티커를 탭해 추가 · 드래그로 이동 · ↻로 회전 · 핑크 핸들로 크기 조절
      </p>
    </div>
  );
};
