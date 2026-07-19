"use client";

import { memo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronRight, ChevronDown, GripVertical, Folder } from "lucide-react";
import type { GroupNodeData } from "./types";
import { INDENTATION_WIDTH } from "./projection";

interface GroupRowProps {
  group: GroupNodeData;
  depth: number;
  isExpanded: boolean;
  isReceivingDrop?: boolean;
  onToggle: (id: string) => void;
}

const statusColors: Record<string, string> = {
  todo: "text-slate-500 bg-slate-100",
  in_progress: "text-blue-500 bg-blue-100",
  done: "text-emerald-500 bg-emerald-100",
};

function GroupRowInner({ group, depth, isExpanded, isReceivingDrop, onToggle }: GroupRowProps) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: group.id,
  });
  
  const { setNodeRef: setDropRef } = useDroppable({ id: group.id });

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const count = group.children ? group.children.length : 0;

  return (
    <div
      ref={setRefs}
      style={{ paddingLeft: depth * INDENTATION_WIDTH + 18 }}
      className={`flex h-11 items-center gap-1.5 rounded-md pr-2 transition-colors border-b border-slate-100 ${
        isReceivingDrop
          ? "bg-blue-50/60 border border-b-0 border-blue-500/45"
          : isDragging
            ? "opacity-30"
            : "opacity-100 hover:bg-slate-50"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(group.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-0"
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-slate-300 hover:text-slate-500"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className={`flex h-6 w-6 items-center justify-center rounded-md ${statusColors[group.status] || statusColors.todo}`}>
        <Folder className="h-3.5 w-3.5" />
      </div>

      <span className="font-semibold text-sm text-slate-700">{group.title}</span>
      
      <span className="ml-2 text-xs font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

export const GroupRow = memo(GroupRowInner);
