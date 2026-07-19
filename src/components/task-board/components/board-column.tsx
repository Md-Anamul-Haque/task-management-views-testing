"use client";

import { memo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TaskCard } from "../components/task-card";
import type { ColumnId, ColumnMeta, Task } from "../types";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useVirtualizer } from "@tanstack/react-virtual";

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

export const BoardColumn = memo(function BoardColumn({
  column,
  tasks,
  columnOrder,
  columns,
  onMoveTask,
  onDeleteTask,
  onAddTask,
}: BoardColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
    },
  });

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 130,
    overscan: 5,
  });

  function setRefs(node: HTMLDivElement | null) {
    scrollRef.current = node;
    setNodeRef(node);
  }

  function submitDraft() {
    const trimmed = draftTitle.trim();
    if (trimmed) onAddTask(trimmed);
    setDraftTitle("");
    setIsAdding(false);
  }

  const taskIds = tasks.map((t) => t.id);

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
        ref={setRefs}
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl px-2 pb-2 transition-colors",
          "scrollbar-thin",
          isOver && "bg-accent/40"
        )}
      >
        {tasks.length === 0 && !isAdding && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 py-8 text-center text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const task = tasks[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: "8px",
                  }}
                >
                  <TaskCard
                    task={task}
                    columnOrder={columnOrder}
                    columns={columns}
                    onMove={(destinationColumnId) => onMoveTask(task.id, destinationColumnId)}
                    onDelete={() => onDeleteTask(task.id)}
                  />
                </div>
              );
            })}
          </div>
        </SortableContext>

        {isAdding && (
          <form
            className="flex flex-col gap-1.5 rounded-xl border bg-card p-2 mt-1"
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
});
