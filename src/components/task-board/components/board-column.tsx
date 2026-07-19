"use client";

import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isTaskDragData } from "../lib/dnd-types";
import { TaskCard } from "../components/task-card";
import type { ColumnId, ColumnMeta, Task } from "../types";

const ACCENT_DOT: Record<ColumnMeta["accent"], string> = {
  slate: "bg-slate-400",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
};

interface BoardColumnProps {
  column: ColumnMeta;
  tasks: Task[];
  columnOrder: ColumnId[];
  columns: Record<ColumnId, ColumnMeta>;
  onMoveTask: (taskId: string, destinationColumnId: ColumnId) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
}

export function BoardColumn({
  column,
  tasks,
  columnOrder,
  columns,
  onMoveTask,
  onDeleteTask,
  onAddTask,
}: BoardColumnProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ type: "column", columnId: column.id }),
      canDrop: ({ source }) => isTaskDragData(source.data),
      getIsSticky: () => true,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [column.id]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    return autoScrollForElements({ element });
  }, []);

  function submitDraft() {
    const trimmed = draftTitle.trim();
    if (trimmed) onAddTask(trimmed);
    setDraftTitle("");
    setIsAdding(false);
  }

  return (
    <section
      aria-label={`${column.title} column`}
      className="flex h-full w-[300px] shrink-0 flex-col rounded-2xl bg-muted/40"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <span
            className={cn("size-2 rounded-full", ACCENT_DOT[column.accent])}
            aria-hidden="true"
          />
          <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
          <span className="rounded-full bg-background px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground"
          aria-label={`Add task to ${column.title}`}
          onClick={() => setIsAdding(true)}
        >
          <Plus className="size-4" />
        </Button>
      </header>

      <div
        ref={scrollRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl px-2 pb-2 transition-colors",
          "scrollbar-thin",
          isDraggedOver && "bg-accent/40",
        )}
      >
        {tasks.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 py-8 text-center text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}

        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            columnAccent={column.accent}
            columnOrder={columnOrder}
            columns={columns}
            onMove={(destinationColumnId) => onMoveTask(task.id, destinationColumnId)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}

        {isAdding && (
          <form
            className="flex flex-col gap-1.5 rounded-xl border bg-card p-2"
            onSubmit={(event) => {
              event.preventDefault();
              submitDraft();
            }}
          >
            <Input
              autoFocus
              value={draftTitle}
              placeholder="Task title"
              aria-label="New task title"
              className="h-8 border-none px-1 text-[13px] shadow-none focus-visible:ring-0"
              onChange={(event) => setDraftTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsAdding(false);
                  setDraftTitle("");
                }
              }}
              onBlur={() => {
                if (!draftTitle.trim()) setIsAdding(false);
              }}
            />
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setIsAdding(false);
                  setDraftTitle("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 px-2.5 text-xs">
                Add
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
