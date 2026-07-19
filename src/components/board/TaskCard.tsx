"use client";

import { useEffect, useRef, useState } from "react";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Layers } from "lucide-react";
import type { Task } from "./types";

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-rose-100 text-rose-700 border-rose-200",
};

export function TaskCard({ task }: { task: Task }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return combine(
      // Makes the card itself draggable
      draggable({
        element: el,
        getInitialData: () => ({
          type: "card",
          taskId: task.id,
          status: task.status,
        }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      }),
      // Makes the card a drop target so other cards can reorder around it
      dropTargetForElements({
        element: el,
        getData: ({ input, element }) => {
          const data = { type: "card", taskId: task.id, status: task.status };
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["top", "bottom"],
          });
        },
        canDrop: ({ source }) => source.data.type === "card" && source.data.taskId !== task.id,
        onDrag: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setClosestEdge(null),
        onDrop: () => setClosestEdge(null),
      }),
    );
  }, [task.id, task.status]);

  return (
    <div ref={ref} className="relative">
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
      <Card
        className={`cursor-grab border-slate-200 transition-all active:cursor-grabbing ${
          dragging
            ? "scale-[0.98] opacity-40"
            : "opacity-100 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <CardContent className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug text-slate-800">
              {task.title}
            </p>
            <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
          </div>
          <div className="flex items-center gap-1.5">
            {task.priority && (
              <Badge
                variant="outline"
                className={`h-5 border px-1.5 py-0 text-[11px] ${priorityStyles[task.priority]}`}
              >
                {task.priority}
              </Badge>
            )}
            {task.hasSubtask && (
              <span className="flex items-center text-slate-400">
                <Layers className="h-3.5 w-3.5" />
              </span>
            )}
            {task.assignee && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                {task.assignee.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
