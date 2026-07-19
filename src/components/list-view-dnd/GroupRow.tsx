"use client";

import { memo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronRightIcon, ChevronDownIcon, GripVerticalIcon } from "lucide-react";
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
  todo: "bg-slate-100 text-slate-600 border-slate-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export interface GroupRowUIProps {
  group: GroupNodeData;
  depth: number;
  isExpanded: boolean;
  isReceivingDrop?: boolean;
  isDragging?: boolean;
  onToggle?: (id: string) => void;
  attributes?: any;
  listeners?: any;
  setRefs?: (node: HTMLDivElement | null) => void;
}

export function GroupRowUI({
  group,
  depth,
  isExpanded,
  isReceivingDrop,
  isDragging,
  onToggle,
  attributes,
  listeners,
  setRefs,
}: GroupRowUIProps) {
  const count = group.children ? group.children.length : 0;

  return (
    <div
      ref={setRefs}
      className={`grid grid-cols-[minmax(300px,1fr)_140px_140px_100px] h-12 items-center border-b border-slate-200 bg-white transition-colors ${isReceivingDrop
          ? "bg-blue-50/60 border-blue-500/45"
          : isDragging
            ? "opacity-30"
            : "opacity-100 hover:bg-slate-50"
        }`}
    >
      <div
        className="flex items-center gap-1.5 overflow-hidden pr-4"
        style={{ paddingLeft: (depth * INDENTATION_WIDTH) + 8 }}
      >
        <button
          type="button"
          onClick={() => onToggle?.(group.id)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 transition-colors"
        >
          {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-slate-300 hover:text-slate-500 transition-colors"
        >
          <GripVerticalIcon className="h-3.5 w-3.5" />
        </button>

        <div className={`flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide shadow-sm ${statusColors[group.status] || statusColors.todo}`}>
          {group.title.toUpperCase()}
        </div>

        <span className="ml-2 text-[11px] font-medium text-slate-400">
          {count} task{count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty columns to maintain grid alignment */}
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

function GroupRowInner(props: GroupRowProps) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: props.group.id,
  });

  const { setNodeRef: setDropRef } = useDroppable({ id: props.group.id });

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  return <GroupRowUI {...props} isDragging={isDragging} attributes={attributes} listeners={listeners} setRefs={setRefs} />;
}

export const GroupRow = memo(GroupRowInner);
