import type { TreeNodeData } from "./types";

export function findNode(nodes: TreeNodeData[], id: string): TreeNodeData | null {
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
  nodes: TreeNodeData[],
  id: string,
): { tree: TreeNodeData[]; removed: TreeNodeData | null } {
  let removed: TreeNodeData | null = null;

  function walk(list: TreeNodeData[]): TreeNodeData[] {
    const next: TreeNodeData[] = [];
    for (const node of list) {
      if (node.id === id) {
        removed = node;
        continue;
      }
      next.push(node.children ? { ...node, children: walk(node.children) } as TreeNodeData : node);
    }
    return next;
  }

  return { tree: walk(nodes), removed };
}

export function insertNode(
  nodes: TreeNodeData[],
  parentId: string | null,
  index: number,
  node: TreeNodeData,
): TreeNodeData[] {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(index, 0, node);
    return next;
  }

  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = n.children ? [...n.children] : [];
      children.splice(index, 0, node);
      if (n.type === "group") {
        return { ...n, children };
      }
      return { ...n, children, hasSubtask: true };
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, index, node) } as TreeNodeData;
    }
    return n;
  });
}

export function updateChildren(
  nodes: TreeNodeData[],
  id: string,
  children: TreeNodeData[],
): TreeNodeData[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, children } as TreeNodeData;
    if (n.children) return { ...n, children: updateChildren(n.children, id, children) } as TreeNodeData;
    return n;
  });
}
