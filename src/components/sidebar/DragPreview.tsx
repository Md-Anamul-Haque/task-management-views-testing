"use client";

import type { DragPreviewProps } from "react-arborist";

export function DragPreview({ offset, dragIds, isDragging }: DragPreviewProps) {
  if (!isDragging || !offset) return null;

  // return (
  //   <div
  //     style={{ position: "fixed", left: offset.x + 12, top: offset.y, pointerEvents: "none" }}
  //     className="z-50 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-lg"
  //   >
  //     {dragIds.length > 1 ? `Moving ${dragIds.length} items` : "Moving item"}
  //   </div>
  // );
  return (
    <div
      style={{ position: "fixed", left: offset.x + 12, top: offset.y, pointerEvents: "none" }}
      className="z-50 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-lg"
    />
  );
}
