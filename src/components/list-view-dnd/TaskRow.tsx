"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { ChevronRight, ChevronDown, Layers, GripVertical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { INDENTATION_WIDTH } from "./projection";
import type { TaskNodeData } from "./types";

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusDot: Record<string, string> = {
  todo: "bg-slate-300",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
};

interface TaskRowProps {
  task: TaskNodeData;
  depth: number;
  isExpanded: boolean;
  isLoadingChildren: boolean;
  isReceivingDrop?: boolean;
  onToggle: (id: string) => void;
}

function TaskRowInner({ task, depth, isExpanded, isLoadingChildren, isReceivingDrop, onToggle }: TaskRowProps) {
  // Draggable: the row can be picked up (via its handle).
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: task.id,
  });
  // Droppable: the row is also a valid target — dnd-kit's collision
  // detection uses this to tell us which row the pointer is nearest to.
  const { setNodeRef: setDropRef } = useDroppable({ id: task.id });

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  return (
    <div
      ref={setRefs}
      style={{ paddingLeft: (depth * INDENTATION_WIDTH) + 8 }}
      className={`flex h-11 items-center gap-1.5 rounded-md pr-2 transition-colors ${isReceivingDrop
        ? "bg-blue-50/60 border border-b-0 border-blue-500/45"
        : isDragging
          ? "opacity-30"
          : "opacity-100 hover:bg-slate-50"
        }`}
    >
      <button
        type="button"
        onClick={() => task.hasSubtask && onToggle(task.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-0"
        disabled={!task.hasSubtask && !isReceivingDrop}
      >
        {(task.hasSubtask || isReceivingDrop) ? (
          isLoadingChildren ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (isExpanded || isReceivingDrop) ? (
            <ChevronDown className={`h-3.5 w-3.5 ${isReceivingDrop ? "text-blue-500" : ""}`} />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )
        ) : null}
      </button>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-slate-300 hover:text-slate-500"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[task.status]}`} />
      <span className="truncate text-sm text-slate-800">{task.title}</span>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">
        {task.priority && (
          <Badge variant="outline" className={`h-5 border px-1.5 py-0 text-[11px] ${priorityStyles[task.priority]}`}>
            {task.priority}
          </Badge>
        )}
        {depth === 0 && task.hasSubtask && (
          <span className="text-slate-400">
            <Layers className="h-3.5 w-3.5" />
          </span>
        )}
        {task.assignee && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
            {task.assignee.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

// Re-renders only when this row's own data actually changes — critical for
// keeping drag interactions smooth in a long, virtualized list.
export const TaskRow = memo(TaskRowInner);
