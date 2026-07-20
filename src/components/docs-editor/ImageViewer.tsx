"use client";

import { useRef, useState, type WheelEvent, type MouseEvent } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

export function ImageViewer({ url, alt = "" }: { url: string; alt?: string }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function clampScale(next: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
  }

  function handleWheel(e: WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setScale((prev) => clampScale(prev + delta));
  }

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (scale <= 1) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y };
    setIsDragging(true);
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  }

  function endDrag() {
    dragState.current = null;
    setIsDragging(false);
  }

  function reset() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg border border-white/10 bg-black/50 p-1 backdrop-blur">
        <button
          type="button"
          onClick={() => setScale((s) => clampScale(s - 0.25))}
          className="flex h-7 w-7 items-center justify-center rounded text-white/80 hover:bg-white/10"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-xs text-white/70">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => setScale((s) => clampScale(s + 0.25))}
          className="flex h-7 w-7 items-center justify-center rounded text-white/80 hover:bg-white/10"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex h-7 w-7 items-center justify-center rounded text-white/80 hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
      >
        <img
          src={url}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.05s linear",
          }}
          className="max-h-full max-w-full select-none object-contain"
        />
      </div>
    </div>
  );
}
