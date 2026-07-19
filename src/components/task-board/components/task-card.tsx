"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatDueDate } from "../lib/date";
import type { ColumnMeta, ColumnId, Task } from "../types";
import { PriorityBadge } from "../components/priority-badge";
import { AssigneeStack } from "../components/assignee-stack";
import { MoveTaskMenu } from "../components/move-task-menu";
import { CalendarClock, ListChecks } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
  columnOrder: ColumnId[];
  columns: Record<ColumnId, ColumnMeta>;
  onMove: (destinationColumnId: ColumnId) => void;
  onDelete: () => void;
  isOverlay?: boolean;
}

export const TaskCard = memo(function TaskCard({
  task,
  columnOrder,
  columns,
  onMove,
  onDelete,
  isOverlay,
}: TaskCardProps) {
  const due = formatDueDate(task.dueDate);

  // If this card is being rendered inside a DragOverlay, we don't want it to register as a sortable node again.
  const sortableParams = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: isOverlay,
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortableParams;

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-dashed border-primary/50 bg-background rounded-xl h-[120px] transition-all"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-task-id={task.id}
      className={cn(
        "group relative rounded-xl border bg-card p-3 shadow-sm transition-all duration-150 cursor-grab",
        "hover:border-foreground/15 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        isOverlay && "cursor-grabbing"
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
                : "bg-muted text-muted-foreground"
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
  );
});
