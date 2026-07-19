import { useEffect, useReducer, useState } from "react";
import invariant from "tiny-invariant";
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder";
import { triggerPostMoveFlash } from "@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash";

import { boardReducer } from "./board-reducer";
import { isTaskDragData, isColumnDropData, isTaskDropData } from "./dnd-types";
import { initialColumnOrder, initialColumns, initialTasksByColumn } from "./mock-data";
import type { BoardAction } from "./board-reducer";
import type { Edge } from "./dnd-types";
import type { BoardState, ColumnId, Task } from "../types";

export type DragState =
  | { type: "idle" }
  | { type: "dragging" }
  | { type: "dragged-over"; closestEdge: Edge | null };

export function useDraggableTask(task: Task, index: number, ref: React.RefObject<HTMLElement | null>) {
  const [dragState, setDragState] = useState<DragState>({ type: "idle" });

  useEffect(() => {
    const element = ref.current;
    invariant(element, "Draggable element ref is null");

    return combine(
      draggable({
        element,
        getInitialData: () => ({
          type: "task",
          taskId: task.id,
          columnId: task.columnId,
          index,
        }),
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: () => ({ x: 16, y: 16 }),
            render({ container }) {
              // Creating a simple drag preview clone
              const preview = element.cloneNode(true) as HTMLElement;
              preview.style.width = `${element.getBoundingClientRect().width}px`;
              preview.classList.remove("opacity-40");
              container.appendChild(preview);
              return () => {
                // Return cleanup fn
              };
            },
          });
        },
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
      }),
    );
  }, [task.id, task.columnId, index, ref]);

  return dragState;
}

export function useColumnDropZone(columnId: ColumnId, scrollRef: React.RefObject<HTMLElement | null>) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    invariant(element, "Column element ref is null");

    return combine(
      dropTargetForElements({
        element,
        getData: () => ({ type: "column", columnId }),
        canDrop: ({ source }) => isTaskDragData(source.data),
        getIsSticky: () => true,
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => setIsDraggedOver(false),
        onDrop: () => setIsDraggedOver(false),
      }),
      autoScrollForElements({ element })
    );
  }, [columnId, scrollRef]);

  return isDraggedOver;
}

// Pure function to resolve a drop into a Redux-like action
export function resolveDrop(
  state: BoardState,
  sourceData: Record<string, unknown>,
  dropTargetsData: Record<string, unknown>[]
): BoardAction | null {
  if (!dropTargetsData.length) return null;
  if (!isTaskDragData(sourceData)) return null;

  const { taskId, columnId: sourceColumnId } = sourceData;
  const innermostData = dropTargetsData[0];

  if (isColumnDropData(innermostData)) {
    const destinationColumnId = innermostData.columnId;
    if (destinationColumnId === sourceColumnId) return null;

    const destinationIndex = state.tasksByColumn[destinationColumnId].length;
    return {
      type: "move-task",
      taskId,
      sourceColumnId,
      destinationColumnId,
      destinationIndex,
    };
  }

  if (isTaskDropData(innermostData)) {
    const destinationTaskId = innermostData.taskId;
    if (destinationTaskId === taskId) return null;

    const destinationColumnId = innermostData.columnId;
    const edge = extractClosestEdge(innermostData);
    const destinationList = state.tasksByColumn[destinationColumnId];
    const indexOfTarget = destinationList.findIndex((t) => t.id === destinationTaskId);
    if (indexOfTarget === -1) return null;

    if (sourceColumnId === destinationColumnId) {
      const startIndex = destinationList.findIndex((t) => t.id === taskId);
      if (startIndex === -1) return null;

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

      return { type: "reorder-column", columnId: destinationColumnId, list: reordered };
    }

    const destinationIndex = edge === "bottom" ? indexOfTarget + 1 : indexOfTarget;
    return {
      type: "move-task",
      taskId,
      sourceColumnId,
      destinationColumnId,
      destinationIndex,
    };
  }

  return null;
}

export function useBoardDragMonitor(
  stateRef: React.MutableRefObject<BoardState>,
  dispatch: React.Dispatch<BoardAction>,
  scrollerRef: React.RefObject<HTMLElement | null>,
  setAnnouncement: (msg: string) => void
) {
  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;
    return autoScrollForElements({ element });
  }, [scrollerRef]);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isTaskDragData(source.data);
      },
      onDrop({ source, location }) {
        const action = resolveDrop(
          stateRef.current,
          source.data,
          location.current.dropTargets.map((t) => t.data)
        );

        if (action) {
          dispatch(action);
          if (action.type === "move-task") {
            const task = Object.values(stateRef.current.tasksByColumn)
              .flat()
              .find((t) => t.id === action.taskId);
            if (task) {
              setAnnouncement(
                `Moved "${task.title}" to ${stateRef.current.columns[action.destinationColumnId].title}`
              );
            }
          }
        }
      },
    });
  }, [stateRef, dispatch, setAnnouncement]);
}

export function useBoard() {
  const [state, dispatch] = useReducer(boardReducer, {
    columnOrder: initialColumnOrder,
    columns: initialColumns,
    tasksByColumn: initialTasksByColumn,
  });

  const applyAction = (action: BoardAction) => dispatch(action);

  const moveTaskToColumn = (taskId: string, sourceColumnId: ColumnId, destinationColumnId: ColumnId) => {
    applyAction({
      type: "move-task",
      taskId,
      sourceColumnId,
      destinationColumnId,
      destinationIndex: state.tasksByColumn[destinationColumnId].length,
    });
  };

  const removeTask = (taskId: string, columnId: ColumnId) => {
    applyAction({ type: "remove-task", taskId, columnId });
  };

  const addTask = (title: string, columnId: ColumnId) => {
    applyAction({ type: "add-task", columnId, title });
  };

  return { state, applyAction, moveTaskToColumn, removeTask, addTask };
}
