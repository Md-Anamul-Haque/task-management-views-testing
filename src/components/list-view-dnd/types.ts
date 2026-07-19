export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskNodeData {
  id: string;
  type?: "task"; // Optional for backwards compatibility, assumed "task" if missing
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
  children: TreeNodeData[] | null;
}

export interface GroupNodeData {
  id: string;
  type: "group";
  title: string;
  status: TaskStatus; // The status this group represents
  children: TreeNodeData[];
}

export type TreeNodeData = TaskNodeData | GroupNodeData;
