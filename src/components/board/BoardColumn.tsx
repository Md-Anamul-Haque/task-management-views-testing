"use client";

import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { TaskCard } from "./TaskCard";
import type { ColumnDef, Task } from "./types";

export function BoardColumn({
  column,
  tasks,
}: {
  column: ColumnDef;
  tasks: Task[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  // Virtualize the card list so a column with hundreds of tasks stays smooth.
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 92,
    overscan: 6,
    getItemKey: (index) => tasks[index].id,
  });

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    // Lets a card be dropped into this column (e.g. an empty column,
    // or the empty space below the last card).
    return dropTargetForElements({
      element: el,
      getData: () => ({ type: "column", status: column.id }),
      canDrop: ({ source }) => source.data.type === "card",
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [column.id]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={columnRef}
      className={`flex h-full w-[300px] shrink-0 flex-col rounded-xl border transition-colors ${
        isOver ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-slate-50/40"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: column.accentColor }}
        />
        <h3 className="text-sm font-semibold text-slate-700">{column.title}</h3>
        <span className="ml-auto text-xs font-medium text-slate-400">
          {tasks.length}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-2">
        {tasks.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
            Drop a task here
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualItems.map((virtualRow) => {
              const task = tasks[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    paddingBottom: 8,
                  }}
                >
                  <TaskCard task={task} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
