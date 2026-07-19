import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import type { ColumnId } from "../types";

/** Pragmatic drag and drop stores drag/drop payloads under `Record<string | symbol, unknown>`. */
type DndData = Record<string | symbol, unknown>;

/** Data attached to a draggable task card. */
export interface TaskDragData extends DndData {
  type: "task";
  taskId: string;
  columnId: ColumnId;
  /** Index of the task within its source column at drag start — used for drag-preview only. */
  index: number;
}

/** Data attached to a task's drop target (used for reordering within/between columns). */
export interface TaskDropData extends DndData {
  type: "task";
  taskId: string;
  columnId: ColumnId;
}

/** Data attached to a column's own drop target (its scrollable list container). */
export interface ColumnDropData extends DndData {
  type: "column";
  columnId: ColumnId;
}

export function isTaskDragData(data: DndData): data is TaskDragData {
  return data.type === "task" && typeof data.taskId === "string";
}

export function isColumnDropData(data: DndData): data is ColumnDropData {
  return data.type === "column" && typeof data.columnId === "string";
}

export function isTaskDropData(data: DndData): data is TaskDropData {
  return data.type === "task" && typeof data.taskId === "string" && typeof data.columnId === "string";
}

export type { Edge };
