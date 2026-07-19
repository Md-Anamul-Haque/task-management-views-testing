"use client";

import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";

import { cn } from "@/lib/utils";
import { formatDueDate } from "../lib/date";
import { isTaskDragData, type Edge } from "../lib/dnd-types";
import { PriorityBadge } from "../components/priority-badge";
import { AssigneeStack } from "../components/assignee-stack";
import { MoveTaskMenu } from "../components/move-task-menu";
import { CalendarClock, ListChecks } from "lucide-react";
import type { ColumnId, ColumnMeta, Task } from "../types";

const ACCENT_LINE: Record<ColumnMeta["accent"], string> = {
  slate: "bg-slate-400",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
};

interface TaskCardProps {
  task: Task;
  index: number;
  columnAccent: ColumnMeta["accent"];
  columnOrder: ColumnId[];
  columns: Record<ColumnId, ColumnMeta>;
  onMove: (destinationColumnId: ColumnId) => void;
  onDelete: () => void;
}

type DragState =
  | { type: "idle" }
  | { type: "dragging" }
  | { type: "dragged-over"; closestEdge: Edge | null };

export function TaskCard({
  task,
  index,
  columnAccent,
  columnOrder,
  columns,
  onMove,
  onDelete,
}: TaskCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        getInitialData: (): Record<string, unknown> => ({
          type: "task",
          taskId: task.id,
          columnId: task.columnId,
          index,
        }),
        onDragStart() {
          setDragState({ type: "dragging" });
        },
        onDrop() {
          setDragState({ type: "idle" });
          triggerPostMoveFlash(element);
        },
      }),
      dropTargetForElements({
        element,
        getData({ input }) {
          return attachClosestEdge(
            { type: "task", taskId: task.id, columnId: task.columnId },
            { element, input, allowedEdges: ["top", "bottom"] },
          );
        },
        canDrop({ source }) {
          return isTaskDragData(source.data) && source.data.taskId !== task.id;
        },
        getIsSticky: () => true,
        onDragEnter({ self }) {
          setDragState({ type: "dragged-over", closestEdge: extractClosestEdge(self.data) });
        },
        onDrag({ self }) {
          const closestEdge = extractClosestEdge(self.data);
          setDragState((current) =>
            current.type === "dragged-over" && current.closestEdge === closestEdge
              ? current
              : { type: "dragged-over", closestEdge },
          );
        },
        onDragLeave() {
          setDragState({ type: "idle" });
        },
        onDrop() {
          setDragState({ type: "idle" });
        },
      })
    );
  }, [task.id, task.columnId, index]);

  const due = formatDueDate(task.dueDate);
  const isDragging = dragState.type === "dragging";
  const closestEdge = dragState.type === "dragged-over" ? dragState.closestEdge : null;

  return (
    <div className="relative">
      {closestEdge === "top" && <DropLine accent={columnAccent} />}

      <div
        ref={ref}
        data-task-id={task.id}
        className={cn(
          "group relative rounded-xl border bg-card p-3 shadow-sm transition-all duration-150 select-none cursor-grab active:cursor-grabbing",
          "hover:border-foreground/15 hover:shadow-md",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          isDragging && "opacity-40",
        )}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium leading-snug text-card-foreground">
            {task.title}
          </p>
          <MoveTaskMenu
            taskTitle={task.title}
            currentColumnId={task.columnId}
            columnOrder={columnOrder}
            columns={columns}
            onMove={onMove}
            onDelete={onDelete}
          />
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.subtasksTotal > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              <ListChecks className="size-3" aria-hidden="true" />
              {task.subtasksDone}/{task.subtasksTotal}
            </span>
          )}
          {due && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                due.isOverdue
                  ? "bg-rose-500/10 text-rose-600"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <CalendarClock className="size-3" aria-hidden="true" />
              {due.label}
            </span>
          )}
        </div>

        {task.assignees.length > 0 && (
          <div className="flex items-center justify-end pt-0.5">
            <AssigneeStack assignees={task.assignees} />
          </div>
        )}
      </div>

      {closestEdge === "bottom" && <DropLine accent={columnAccent} />}
    </div>
  );
}

function DropLine({ accent }: { accent: ColumnMeta["accent"] }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 my-[-5px] flex h-[10px] items-center px-1">
      <span
        className={cn(
          "h-[2px] w-full rounded-full shadow-[0_0_6px_rgba(0,0,0,0.15)]",
          ACCENT_LINE[accent],
        )}
      />
    </div>
  );
}


