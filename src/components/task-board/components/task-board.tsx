"use client";

import { useEffect, useReducer, useRef, useState } from "react";
// import invariant from "tiny-invariant";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";

import { boardReducer } from "../lib/board-reducer";
import { isColumnDropData, isTaskDropData, isTaskDragData } from "../lib/dnd-types";
import { initialColumnOrder, initialColumns, initialTasksByColumn } from "../lib/mock-data";
import { BoardColumn } from "../components/board-column";
import { ColumnSkeleton } from "../components/column-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ColumnId } from "../types";

/**
 * Set to `true` (or wire up real fetching) once this board is connected to an API —
 * the skeleton and this flag are here so the loading path isn't an afterthought.
 */
const SIMULATED_INITIAL_LOAD_MS = 500;

export function TaskBoard() {
  const [state, dispatch] = useReducer(boardReducer, {
    columnOrder: initialColumnOrder,
    columns: initialColumns,
    tasksByColumn: initialTasksByColumn,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // The drop monitor below is subscribed once; it reads state through this ref so the
  // subscription never goes stale without needing to be torn down and rebuilt on every move.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_INITIAL_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  // Horizontal auto-scroll for the board while dragging a card near either edge.
  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;
    return autoScrollForElements({ element });
  }, []);

  useEffect(() => {
    function announceMove(taskId: string, destinationColumnId: ColumnId) {
      const current = stateRef.current;
      const task = Object.values(current.tasksByColumn)
        .flat()
        .find((t) => t.id === taskId);
      if (!task) return;
      setAnnouncement(`Moved "${task.title}" to ${current.columns[destinationColumnId].title}`);
    }

    return monitorForElements({
      canMonitor({ source }) {
        return isTaskDragData(source.data);
      },
      onDrop({ source, location }) {
        const dropTargets = location.current.dropTargets;
        if (!dropTargets.length) return;

        const sourceData = source.data;
        if (!isTaskDragData(sourceData)) return;

        const { taskId, columnId: sourceColumnId } = sourceData;
        const innermost = dropTargets[0];
        const innermostData = innermost.data;
        const current = stateRef.current;

        // Dropped on the column's empty area (below the last card, or an empty column).
        if (isColumnDropData(innermostData)) {
          const destinationColumnId = innermostData.columnId;
          if (destinationColumnId === sourceColumnId) return;

          const destinationIndex = current.tasksByColumn[destinationColumnId].length;
          dispatch({
            type: "move-task",
            taskId,
            sourceColumnId,
            destinationColumnId,
            destinationIndex,
          });
          announceMove(taskId, destinationColumnId);
          return;
        }

        // Dropped on (or beside) another card.
        if (isTaskDropData(innermostData)) {
          const destinationTaskId = innermostData.taskId;
          if (destinationTaskId === taskId) return;

          const destinationColumnId = innermostData.columnId;
          const edge = extractClosestEdge(innermostData);
          const destinationList = current.tasksByColumn[destinationColumnId];
          const indexOfTarget = destinationList.findIndex((t) => t.id === destinationTaskId);
          if (indexOfTarget === -1) return;

          if (sourceColumnId === destinationColumnId) {
            const startIndex = destinationList.findIndex((t) => t.id === taskId);
            if (startIndex === -1) return;

            const destinationIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget: edge,
              axis: "vertical",
            });

            const reordered = reorder({
              list: destinationList,
              startIndex,
              finishIndex: destinationIndex,
            });

            dispatch({ type: "reorder-column", columnId: destinationColumnId, list: reordered });
            return;
          }

          const destinationIndex = edge === "bottom" ? indexOfTarget + 1 : indexOfTarget;
          dispatch({
            type: "move-task",
            taskId,
            sourceColumnId,
            destinationColumnId,
            destinationIndex,
          });
          announceMove(taskId, destinationColumnId);
        }
      },
    });
  }, []);

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-full flex-col">
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>

        <div
          ref={scrollerRef}
          className="flex h-full min-h-0 flex-1 items-start gap-3 overflow-x-auto p-4"
        >
          {isLoading
            ? state.columnOrder.map((columnId) => <ColumnSkeleton key={columnId} />)
            : state.columnOrder.map((columnId) => (
              <BoardColumn
                key={columnId}
                column={state.columns[columnId]}
                tasks={state.tasksByColumn[columnId]}
                columnOrder={state.columnOrder}
                columns={state.columns}
                onMoveTask={(taskId, destinationColumnId) => {
                  // This column only ever renders its own tasks, so it's always the source.
                  dispatch({
                    type: "move-task",
                    taskId,
                    sourceColumnId: columnId,
                    destinationColumnId,
                    destinationIndex: state.tasksByColumn[destinationColumnId].length,
                  });
                }}
                onDeleteTask={(taskId) => dispatch({ type: "remove-task", taskId, columnId })}
                onAddTask={(title) => dispatch({ type: "add-task", columnId, title })}
              />
            ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
