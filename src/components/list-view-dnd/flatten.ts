import type { TaskNodeData } from "./types";

export interface FlatRow {
  task: TaskNodeData;
  depth: number;
  parentId: string | null;
}

/**
 * Virtualization needs a flat array to index into. This walks the tree,
 * including a subtree only if its parent is both expandable and currently
 * expanded — collapsed branches simply don't produce rows.
 */
export function flattenVisible(
  tasks: TaskNodeData[],
  expanded: Set<string>,
  depth = 0,
  parentId: string | null = null,
): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const task of tasks) {
    rows.push({ task, depth, parentId });
    if (task.hasSubtask && expanded.has(task.id) && task.children) {
      rows.push(...flattenVisible(task.children, expanded, depth + 1, task.id));
    }
  }
  return rows;
}
