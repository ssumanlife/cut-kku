"use client";

import { useRef, useState } from "react";
import { FrameCanvas } from "@widgets/frame-canvas";
import { FrameTypeSelector } from "@features/frame-type-selector";
import { FilterSelector } from "@features/filter-selector";
import { BackgroundColorPicker } from "@features/background-color-picker";
import { TextEditor } from "@features/text-editor";
import { StickerPanel } from "@features/sticker-panel";
import { DownloadButton } from "@features/download-button";
import { ShareButton } from "@features/share-button";
import { useEditorStore } from "@entities/frame";

const CANVAS_HINT: Record<string, string> = {
  A: "왼쪽 스트립을 클릭해 편집하세요",
  B: "왼쪽 스트립을 클릭해 편집하세요",
  C: "각 슬롯을 클릭해 사진을 추가하세요",
};

export type MobilePanelTab =
  | "frame"
  | "background"
  | "filter"
  | "text"
  | "sticker";

const MOBILE_TABS: { id: MobilePanelTab; icon: string; label: string }[] = [
  { id: "frame", icon: "⊞", label: "프레임" },
  { id: "background", icon: "🎨", label: "배경색" },
  { id: "filter", icon: "✨", label: "필터" },
  { id: "text", icon: "T", label: "텍스트" },
  { id: "sticker", icon: "⭐", label: "스티커" },
];

export const EditorLayout = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rightCanvasRef = useRef<HTMLDivElement>(null);
  const frameType = useEditorStore((s) => s.frameType);
  const [activeTab, setActiveTab] = useState<MobilePanelTab>("frame");
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleTabClick = (tab: MobilePanelTab) => {
    if (activeTab === tab) {
      setIsPanelOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsPanelOpen(true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-dvh md:h-screen overflow-hidden">
      {/* ── 데스크톱 사이드바 (md+) ── */}
      <aside className="hidden md:flex md:w-72 md:min-w-72 bg-white border-r border-gray-200 flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-pink-500">✂ 컷꾸</h1>
          <p className="text-xs text-gray-400 mt-0.5">나만의 인생네컷 꾸미기</p>
        </div>

        <div className="flex flex-col gap-5 p-4 flex-1 overflow-y-auto">
          <FrameTypeSelector />
          <BackgroundColorPicker />
          <FilterSelector />
          <TextEditor />
          <StickerPanel />
        </div>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <DownloadButton
            canvasRef={canvasRef}
            rightCanvasRef={rightCanvasRef}
            variant="sidebar"
          />
          <ShareButton variant="sidebar" />
          <p className="text-[10px] text-center text-gray-300 mt-1">
            © 2026 Sumin. All rights reserved.
          </p>
        </div>
      </aside>

      {/* ── 모바일 헤더 (< md) ── */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <div>
          <h1 className="text-base font-bold text-pink-500">✂ 컷꾸</h1>
          <p className="text-[10px] text-gray-400 leading-none mt-0.5">
            나만의 인생네컷 꾸미기
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ShareButton variant="mobile" />
          <DownloadButton
            canvasRef={canvasRef}
            rightCanvasRef={rightCanvasRef}
            variant="mobile"
          />
        </div>
      </header>

      {/* ── 캔버스 영역 ── */}
      <main className="flex-1 flex flex-col items-center md:justify-center bg-[#f5f0eb] overflow-y-auto p-4 md:p-6 min-h-0">
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="w-full">
            <FrameCanvas
              canvasRef={canvasRef}
              rightCanvasRef={rightCanvasRef}
            />
          </div>
          <p className="text-[11px] md:text-xs text-gray-400 text-center whitespace-nowrap">
            {CANVAS_HINT[frameType]}
            {(frameType === "A" || frameType === "B") && (
              <span className="hidden md:inline">
                {" "}
                · 오른쪽은 자동으로 복제됩니다
              </span>
            )}
          </p>
        </div>

        {/* 모바일 저작권 */}
        <p className="md:hidden text-[10px] text-gray-300 mt-4">
          © 2026 Sumin. All rights reserved.
        </p>
      </main>

      {/* ── 모바일 하단 컨트롤 패널 (< md) ── */}
      <div className="md:hidden shrink-0 bg-white border-t border-gray-200">
        {isPanelOpen && (
          <div className="px-4 py-3 overflow-y-auto max-h-52 border-b border-gray-100">
            {activeTab === "frame" && <FrameTypeSelector />}
            {activeTab === "background" && <BackgroundColorPicker />}
            {activeTab === "filter" && <FilterSelector />}
            {activeTab === "text" && <TextEditor />}
            {activeTab === "sticker" && <StickerPanel />}
          </div>
        )}

        <nav className="flex items-center">
          <button
            onClick={() => setIsPanelOpen((prev) => !prev)}
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 text-gray-400 hover:text-pink-400 transition-colors shrink-0"
            aria-label={isPanelOpen ? "패널 닫기" : "패널 열기"}
          >
            <span className="text-base leading-none">
              {isPanelOpen ? "▼" : "▲"}
            </span>
            <span className="text-[10px] leading-none">
              {isPanelOpen ? "닫기" : "열기"}
            </span>
          </button>
          <div className="w-px h-8 bg-gray-200 shrink-0" />
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors",
                activeTab === tab.id && isPanelOpen
                  ? "text-pink-500"
                  : "text-gray-400",
              ].join(" ")}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          ))}
          <div className="w-px h-8 bg-gray-200 shrink-0" />
          <DownloadButton
            canvasRef={canvasRef}
            rightCanvasRef={rightCanvasRef}
            variant="mobile"
          />
        </nav>
      </div>
    </div>
  );
};
