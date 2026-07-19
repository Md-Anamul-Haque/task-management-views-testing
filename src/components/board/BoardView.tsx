"use client";

import { useEffect, useMemo, useState } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { BoardColumn } from "./BoardColumn";
import type { ColumnDef, Task, TaskStatus } from "./types";

const COLUMNS: ColumnDef[] = [
  { id: "todo", title: "To Do", accentColor: "#94a3b8" },
  { id: "in_progress", title: "In Progress", accentColor: "#3b82f6" },
  { id: "done", title: "Done", accentColor: "#22c55e" },
];

export function BoardView({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceTaskId = source.data.taskId as string;
        const destData = destination.data as {
          type: string;
          status?: TaskStatus;
          taskId?: string;
        };

        let nextStatus: TaskStatus | null = null;

        setTasks((prev) => {
          const sourceIndex = prev.findIndex((t) => t.id === sourceTaskId);
          if (sourceIndex === -1) return prev;
          const moving = prev[sourceIndex];

          let targetStatus: TaskStatus = moving.status;
          let targetIndex = prev.length;

          if (destData.type === "column") {
            targetStatus = destData.status!;
            const columnTasks = prev.filter(
              (t) => t.status === targetStatus && t.id !== moving.id,
            );
            const lastInColumn = columnTasks[columnTasks.length - 1];
            targetIndex = lastInColumn ? prev.indexOf(lastInColumn) + 1 : prev.length;
          } else if (destData.type === "card") {
            const destTask = prev.find((t) => t.id === destData.taskId);
            if (!destTask) return prev;
            targetStatus = destTask.status;
            const edge = extractClosestEdge(destData);
            const destIndex = prev.indexOf(destTask);
            targetIndex = edge === "bottom" ? destIndex + 1 : destIndex;
          }

          const without = prev.filter((t) => t.id !== moving.id);
          const updated = { ...moving, status: targetStatus };
          const clampedIndex = Math.max(0, Math.min(targetIndex, without.length));
          without.splice(clampedIndex, 0, updated);

          nextStatus = targetStatus;
          return without;
        });

        // Fire the API call after the optimistic UI update above.
        // Only needed when the status actually changed.
        if (nextStatus) {
          // Example: PATCH /tasks/:id  { status: nextStatus }
          // fetch(`/api/tasks/${sourceTaskId}`, {
          //   method: "PATCH",
          //   body: JSON.stringify({ status: nextStatus }),
          // });
        }
      },
    });
  }, []);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of tasks) map[task.status].push(task);
    return map;
  }, [tasks]);

  return (
    <div className="flex h-full gap-4 overflow-x-auto bg-white p-4">
      {COLUMNS.map((column) => (
        <BoardColumn key={column.id} column={column} tasks={grouped[column.id]} />
      ))}
    </div>
  );
}
