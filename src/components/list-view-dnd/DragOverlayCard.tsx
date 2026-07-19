"use client";

import { AlertCircle } from "lucide-react";
import type { GroupNodeData, TaskNodeData, TreeNodeData } from "./types";
import { TaskRowUI } from "./TaskRow";
import { GroupRowUI } from "./GroupRow";

export function DragOverlayCard({ task, isNestingPrevented }: { task: TreeNodeData, isNestingPrevented?: boolean }) {
  if (task.type === "group") {
    return (
      <div className="rounded-md border border-slate-200 bg-white shadow-lg w-full max-w-[800px]">
        <GroupRowUI
          group={task as GroupNodeData}
          depth={0}
          isExpanded={false}
          isDragging={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-full max-w-[800px]">
      <div className={`rounded-md border bg-white shadow-lg ${isNestingPrevented ? "border-rose-300 ring-2 ring-rose-200" : "border-slate-200"}`}>
        <TaskRowUI
          task={task as TaskNodeData}
          depth={0}
          isExpanded={false}
          isLoadingChildren={false}
          isDragging={false}
        />
      </div>
      {isNestingPrevented && (
        <div className="absolute top-full left-0 mt-1.5 flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-3.5 w-3.5" />
          This task already contains subtasks, so it cannot be moved inside another task.
        </div>
      )}
    </div>
  );
}
