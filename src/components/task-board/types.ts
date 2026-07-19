export type ColumnId = "todo" | "in_progress" | "in_review" | "done";

export type Priority = "urgent" | "high" | "medium" | "low";

export interface Assignee {
  id: string;
  name: string;
  avatarUrl?: string;
  /** Fallback initials shown when avatarUrl is missing or fails to load. */
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  /** ISO 8601 date string, e.g. "2026-07-22". */
  dueDate?: string;
  assignees: Assignee[];
  subtasksDone: number;
  subtasksTotal: number;
  columnId: ColumnId;
}

export interface ColumnMeta {
  id: ColumnId;
  title: string;
  /** Tailwind color stem used for the column's accent dot, drop indicator and header. */
  accent: "slate" | "indigo" | "violet" | "emerald";
}

export type TasksByColumn = Record<ColumnId, Task[]>;

export interface BoardState {
  columnOrder: ColumnId[];
  columns: Record<ColumnId, ColumnMeta>;
  tasksByColumn: TasksByColumn;
}
