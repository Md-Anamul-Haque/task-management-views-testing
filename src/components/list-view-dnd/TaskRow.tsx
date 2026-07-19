"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { INDENTATION_WIDTH } from "./projection";
import type { TaskNodeData } from "./types";
import { StatusSelector } from "@/components/shared/StatusSelector";
import { PrioritySelector } from "@/components/shared/PrioritySelector";
import { AssigneeSelector } from "@/components/shared/AssigneeSelector";
import { ChevronDownIcon, ChevronRightIcon, GripVerticalIcon, LayersIcon, Loader2Icon } from "lucide-react";



interface TaskRowProps {
  task: TaskNodeData;
  depth: number;
  isExpanded: boolean;
  isLoadingChildren: boolean;
  isReceivingDrop?: boolean;
  onToggle: (id: string) => void;
  onTaskChange?: (id: string, updates: Partial<TaskNodeData>) => void;
}

export interface TaskRowUIProps {
  task: TaskNodeData;
  depth: number;
  isExpanded: boolean;
  isLoadingChildren: boolean;
  isReceivingDrop?: boolean;
  isDragging?: boolean;
  onToggle?: (id: string) => void;
  onTaskChange?: (id: string, updates: Partial<TaskNodeData>) => void;
  attributes?: any;
  listeners?: any;
  setRefs?: (node: HTMLDivElement | null) => void;
}

export function TaskRowUI({
  task,
  depth,
  isExpanded,
  isLoadingChildren,
  isReceivingDrop,
  isDragging,
  onToggle,
  onTaskChange,
  attributes,
  listeners,
  setRefs,
}: TaskRowUIProps) {
  return (
    <div
      ref={setRefs}
      className={`grid grid-cols-[minmax(300px,1fr)_140px_140px_100px] h-11 items-center border-b border-slate-100 transition-colors ${isReceivingDrop
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
          onClick={() => task.hasSubtask && onToggle?.(task.id)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-0"
          disabled={!task.hasSubtask && !isReceivingDrop}
        >
          {(task.hasSubtask || isReceivingDrop) ? (
            isLoadingChildren ? (
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
            ) : (isExpanded || isReceivingDrop) ? (
              <ChevronDownIcon className={`h-3.5 w-3.5 ${isReceivingDrop ? "text-blue-500" : ""}`} />
            ) : (
              <ChevronRightIcon className="h-3.5 w-3.5" />
            )
          ) : null}
        </button>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-slate-300 hover:text-slate-500"
        >
          <GripVerticalIcon className="h-3.5 w-3.5" />
        </button>

        <span className="truncate text-[13px] text-slate-700 font-medium">{task.title}</span>

        {depth === 0 && task.hasSubtask && (
          <span className="text-slate-400 ml-1 shrink-0">
            <LayersIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="flex items-center px-2 overflow-hidden">
        <AssigneeSelector
          assignee={task.assignee}
          onChange={(newAssignee) => onTaskChange?.(task.id, { assignee: newAssignee })}
        />
      </div>

      <div className="flex items-center px-2">
        <StatusSelector
          status={task.status}
          onChange={(newStatus) => onTaskChange?.(task.id, { status: newStatus as TaskNodeData["status"] })}
        />
      </div>

      <div className="flex items-center px-2">
        <PrioritySelector
          priority={task.priority}
          onChange={(newPriority) => onTaskChange?.(task.id, { priority: newPriority as TaskNodeData["priority"] })}
        />
      </div>
    </div>
  );
}

function TaskRowInner(props: TaskRowProps) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: props.task.id,
  });
  const { setNodeRef: setDropRef } = useDroppable({ id: props.task.id });

  const setRefs = (node: HTMLDivElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  return <TaskRowUI {...props} isDragging={isDragging} attributes={attributes} listeners={listeners} setRefs={setRefs} />;
}

// Re-renders only when this row's own data actually changes — critical for
// keeping drag interactions smooth in a long, virtualized list.
export const TaskRow = memo(TaskRowInner);
