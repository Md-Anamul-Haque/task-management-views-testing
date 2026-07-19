export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  priority?: "low" | "medium" | "high";
  assignee?: string;
  /** True if this task has subtasks. Board view never shows subtasks directly. */
  hasSubtask?: boolean;
  status: TaskStatus;
}

export interface ColumnDef {
  id: TaskStatus;
  title: string;
  accentColor: string;
}
