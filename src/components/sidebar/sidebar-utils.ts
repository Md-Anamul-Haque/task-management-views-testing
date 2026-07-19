import { LIST_TYPE_META } from "./list-type-meta";
import type { ListType, NodeKind, SidebarNodeData } from "./types";

export function createNode(kind: NodeKind, listType?: ListType): SidebarNodeData {
  const id = crypto.randomUUID();

  if (kind === "list") {
    const meta = LIST_TYPE_META[listType!];
    return { id, name: meta.defaultName, kind, listType };
  }

  return {
    id,
    name: kind === "space" ? "New Space" : "New Folder",
    kind,
    children: [],
  };
}

export function findNode(nodes: SidebarNodeData[], id: string): SidebarNodeData | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function removeNode(
  nodes: SidebarNodeData[],
  id: string,
): { tree: SidebarNodeData[]; removed: SidebarNodeData | null } {
  let removed: SidebarNodeData | null = null;

  function walk(list: SidebarNodeData[]): SidebarNodeData[] {
    const next: SidebarNodeData[] = [];
    for (const node of list) {
      if (node.id === id) {
        removed = node;
        continue;
      }
      next.push(node.children ? { ...node, children: walk(node.children) } : node);
    }
    return next;
  }

  return { tree: walk(nodes), removed };
}

export function insertNode(
  nodes: SidebarNodeData[],
  parentId: string | null,
  index: number,
  node: SidebarNodeData,
): SidebarNodeData[] {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(index, 0, node);
    return next;
  }

  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = n.children ? [...n.children] : [];
      children.splice(index, 0, node);
      return { ...n, children };
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, index, node) };
    }
    return n;
  });
}

export function updateNode(
  nodes: SidebarNodeData[],
  id: string,
  patch: Partial<SidebarNodeData>,
): SidebarNodeData[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children) return { ...n, children: updateNode(n.children, id, patch) };
    return n;
  });
}
