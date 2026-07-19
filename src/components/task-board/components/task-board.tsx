"use client";

import { useEffect, useReducer, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

import { boardReducer } from "../lib/board-reducer";
import { initialColumnOrder, initialColumns, initialTasksByColumn } from "../lib/mock-data";
import { BoardColumn } from "../components/board-column";
import { ColumnSkeleton } from "../components/column-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaskCard } from "./task-card";
import type { ColumnId, Task } from "../types";

const SIMULATED_INITIAL_LOAD_MS = 500;

export function TaskBoard() {
  const [state, dispatch] = useReducer(boardReducer, {
    columnOrder: initialColumnOrder,
    columns: initialColumns,
    tasksByColumn: initialTasksByColumn,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_INITIAL_LOAD_MS);
    return () => clearTimeout(timer);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    const activeTask = active.data.current?.task as Task;
    const activeColumnId = activeTask.columnId;
    let overColumnId: ColumnId | null = null;

    if (isOverTask) {
      const overTask = over.data.current?.task as Task;
      overColumnId = overTask.columnId;
    } else if (isOverColumn) {
      overColumnId = overId as ColumnId;
    }

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    // Moving between columns
    const overItems = state.tasksByColumn[overColumnId];
    let newIndex = overItems.length;

    if (isOverTask) {
      const overIndex = overItems.findIndex((t) => t.id === overId);
      const isBelowOverItem =
        over &&
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    dispatch({
      type: "move-task",
      taskId: activeId,
      sourceColumnId: activeColumnId,
      destinationColumnId: overColumnId,
      destinationIndex: newIndex,
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTaskData = active.data.current?.task as Task | undefined;
    const activeColumnId = activeTaskData?.columnId;
    if (!activeColumnId) return;

    let overColumnId: ColumnId | null = null;
    if (over.data.current?.type === "Column") {
      overColumnId = overId as ColumnId;
    } else if (over.data.current?.type === "Task") {
      const overTaskData = over.data.current?.task as Task;
      overColumnId = overTaskData.columnId;
    }

    if (!overColumnId) return;

    if (activeColumnId === overColumnId) {
      // Reorder within the same column
      const items = state.tasksByColumn[activeColumnId];
      const activeIndex = items.findIndex((t) => t.id === activeId);
      const overIndex = items.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        // dnd-kit arrayMove equivalent
        const newItems = [...items];
        const [movedItem] = newItems.splice(activeIndex, 1);
        newItems.splice(overIndex, 0, movedItem);

        dispatch({
          type: "reorder-column",
          columnId: activeColumnId,
          list: newItems,
        });
      }
    }
  }

  return (
    <TooltipProvider delay={200}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-full min-h-0 flex-1 items-start gap-3 overflow-x-auto p-4">
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
                    dispatch({
                      type: "move-task",
                      taskId,
                      sourceColumnId: columnId,
                      destinationColumnId,
                      destinationIndex: state.tasksByColumn[destinationColumnId].length,
                    });
                  }}
                  onDeleteTask={(taskId) =>
                    dispatch({ type: "remove-task", taskId, columnId })
                  }
                  onAddTask={(title) => dispatch({ type: "add-task", columnId, title })}
                />
              ))}
          </div>
        </div>

        {typeof window !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
              }}
            >
              {activeTask ? (
                <div className="opacity-80 scale-105 rotate-2 transition-transform shadow-2xl">
                  <TaskCard
                    task={activeTask}
                    columnOrder={state.columnOrder}
                    columns={state.columns}
                    onMove={() => { }}
                    onDelete={() => { }}
                    isOverlay
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </TooltipProvider>
  );
}
