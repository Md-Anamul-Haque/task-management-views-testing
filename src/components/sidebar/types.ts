/**
 * Hierarchy: Space (root only) → Folder → List
 * A List is a leaf — it holds a `listType` (Task List, Dashboard, Doc, etc.)
 * and never has children.
 */
export type NodeKind = "space" | "folder" | "list";

export type ListType =
  | "task_list"
  | "dashboard"
  | "doc"
  | "whiteboard"
  | "form"
  | "chat"
  | "table";

export interface SidebarNodeData {
  id: string;
  name: string;
  kind: NodeKind;
  /** Only present when kind === "list". */
  listType?: ListType;
  /** Avatar color for a Space, e.g. "#7c5cff". */
  color?: string;
  isFavorite?: boolean;
  /**
   * Present (possibly `[]`) for space/folder — these are containers.
   * Absent (`undefined`) for list — lists are always leaves.
   */
  children?: SidebarNodeData[];
}
