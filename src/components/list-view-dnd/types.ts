export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskNodeData {
  id: string;
  title: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  hasSubtask: boolean;
  /**
   * `null`  → not fetched yet (lazy-loaded on first expand)
   * `[]`    → fetched, confirmed no subtasks
   * `[...]` → fetched, has subtasks
   */
  children: TaskNodeData[] | null;
}
