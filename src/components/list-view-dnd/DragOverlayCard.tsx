"use client";

import type { TaskNodeData } from "./types";

export function DragOverlayCard({ task }: { task: TaskNodeData }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 shadow-lg">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      <span className="truncate text-sm font-medium text-slate-800">{task.title}</span>
    </div>
  );
}
