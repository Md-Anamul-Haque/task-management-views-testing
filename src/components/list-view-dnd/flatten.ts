import type { TreeNodeData } from "./types";

export interface FlatRow {
  task: TreeNodeData;
  depth: number;
  parentId: string | null;
}

/**
 * Virtualization needs a flat array to index into. This walks the tree,
 * including a subtree only if its parent is both expandable and currently
 * expanded — collapsed branches simply don't produce rows.
 */
export function flattenVisible(
  tasks: TreeNodeData[],
  expanded: Set<string>,
  activeId: string | null = null,
  depth = 0,
  parentId: string | null = null,
): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const task of tasks) {
    rows.push({ task, depth, parentId });
    
    let shouldExpand = false;
    if (task.type === "group") {
      shouldExpand = expanded.has(task.id) && Array.isArray(task.children);
    } else {
      shouldExpand = task.hasSubtask && expanded.has(task.id) && Array.isArray(task.children);
    }

    if (shouldExpand && task.id !== activeId) {
      rows.push(...flattenVisible(task.children!, expanded, activeId, depth + 1, task.id));
    }
  }
  return rows;
}
