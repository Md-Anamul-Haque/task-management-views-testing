import type { TaskNodeData } from "./types";

export function findNode(nodes: TaskNodeData[], id: string): TaskNodeData | null {
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
  nodes: TaskNodeData[],
  id: string,
): { tree: TaskNodeData[]; removed: TaskNodeData | null } {
  let removed: TaskNodeData | null = null;

  function walk(list: TaskNodeData[]): TaskNodeData[] {
    const next: TaskNodeData[] = [];
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
  nodes: TaskNodeData[],
  parentId: string | null,
  index: number,
  node: TaskNodeData,
): TaskNodeData[] {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(index, 0, node);
    return next;
  }

  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = n.children ? [...n.children] : [];
      children.splice(index, 0, node);
      return { ...n, children, hasSubtask: true };
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, index, node) };
    }
    return n;
  });
}

export function updateChildren(
  nodes: TaskNodeData[],
  id: string,
  children: TaskNodeData[],
): TaskNodeData[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, children };
    if (n.children) return { ...n, children: updateChildren(n.children, id, children) };
    return n;
  });
}
