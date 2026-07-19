"use client";

import { useCallback, useRef, useState } from "react";
import { Tree, type MoveHandler, type RenameHandler, type TreeApi } from "react-arborist";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { initialSidebarData } from "./mock-data";
import { createNode, findNode, insertNode, removeNode, updateNode } from "./sidebar-utils";
import { SidebarRow } from "./SidebarRow";
import { Cursor } from "./Cursor";
import type { ListType, SidebarNodeData } from "./types";

const SPACE_COLORS = ["#7c5cff", "#ff6b6b", "#22c55e", "#f59e0b", "#06b6d4"];

interface SidebarProps {
  height?: number;
  className?: string;
}

export function Sidebar({ height = 640, className = "" }: SidebarProps) {
  const [data, setData] = useState<SidebarNodeData[]>(initialSidebarData);
  const [search, setSearch] = useState("");
  const treeRef = useRef<TreeApi<SidebarNodeData>>(null);

  // --- Hierarchy rule: Space is root-only and can never become a child.
  // Folder must live directly under a Space. A file (list) can sit under
  // a Space or a Folder, but never under another file.
  const disableDrop = useCallback(
    ({ dragNodes, parentNode }: { dragNodes: { data: SidebarNodeData }[]; parentNode: { data: SidebarNodeData } | null }) => {
      const parentKind = parentNode?.data.kind ?? "root";
      return dragNodes.some(({ data }) => {
        if (data.kind === "space") return parentKind !== "root";
        if (data.kind === "folder") return parentKind !== "space";
        return parentKind !== "space" && parentKind !== "folder"; // list
      });
    },
    [],
  );

  const handleMove: MoveHandler<SidebarNodeData> = useCallback(({ dragIds, parentId, index }) => {
    setData((prev) => {
      let tree = prev;
      const moved: SidebarNodeData[] = [];
      for (const id of dragIds) {
        const { tree: next, removed } = removeNode(tree, id);
        tree = next;
        if (removed) moved.push(removed);
      }
      let insertAt = index;
      for (const node of moved) {
        tree = insertNode(tree, parentId, insertAt, node);
        insertAt += 1;
      }
      return tree;
    });

    // Persist: dragIds.forEach((id) => fetch(`/api/nodes/${id}`, { method: "PATCH", body: JSON.stringify({ parentId }) }));
  }, []);

  const handleRename: RenameHandler<SidebarNodeData> = useCallback(({ id, name }) => {
    setData((prev) => updateNode(prev, id, { name }));
    // Persist: fetch(`/api/nodes/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
  }, []);

  const handleAddSpace = useCallback(() => {
    const space = createNode("space");
    space.color = SPACE_COLORS[data.length % SPACE_COLORS.length];
    setData((prev) => [...prev, space]);
    requestAnimationFrame(() => treeRef.current?.edit(space.id));
  }, [data.length]);

  const handleAddFolder = useCallback((parentId: string) => {
    const folder = createNode("folder");
    setData((prev) => insertNode(prev, parentId, 0, folder));
    treeRef.current?.open(parentId);
    requestAnimationFrame(() => treeRef.current?.edit(folder.id));
  }, []);

  const handleAddList = useCallback((parentId: string, listType: ListType) => {
    const list = createNode("list", listType);
    setData((prev) => insertNode(prev, parentId, 0, list));
    treeRef.current?.open(parentId);
    requestAnimationFrame(() => treeRef.current?.edit(list.id));
  }, []);

  const handleDuplicate = useCallback((id: string) => {
    setData((prev) => {
      const node = findNode(prev, id);
      if (!node) return prev;
      const clone: SidebarNodeData = {
        ...node,
        id: crypto.randomUUID(),
        name: `${node.name} (copy)`,
        children: node.children ? [...node.children] : undefined,
      };
      const parentIndex = treeRef.current?.get(id)?.parent;
      const parentId = parentIndex?.isRoot ? null : (parentIndex?.data.id ?? null);
      return insertNode(prev, parentId, 0, clone);
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setData((prev) => removeNode(prev, id).tree);
    // Persist: fetch(`/api/nodes/${id}`, { method: "DELETE" });
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setData((prev) => {
      const node = findNode(prev, id);
      return updateNode(prev, id, { isFavorite: !node?.isFavorite });
    });
  }, []);

  return (
    <div className={`flex flex-col rounded-xl border border-slate-200 bg-white ${className}`}>
      <div className="flex items-center gap-2 border-b border-slate-100 p-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-8 pl-7 text-sm"
          />
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleAddSpace} title="Add space">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden p-1">
        <Tree<SidebarNodeData>
          ref={treeRef}
          data={data}
          searchTerm={search}
          searchMatch={(node, term) => node.data.name.toLowerCase().includes(term.toLowerCase())}
          onMove={handleMove}
          onRename={handleRename}
          disableDrop={disableDrop}
          // disableEdit={false}
          openByDefault={false}
          rowHeight={32}
          indent={18}
          width="100%"
          height={height}
          renderCursor={Cursor}
        // renderDragPreview={DragPreview}
        >
          {(props) => (
            <SidebarRow
              {...props}
              onAddFolder={handleAddFolder}
              onAddList={handleAddList}
              onRename={(id, name) => treeRef.current?.get(id)?.submit(name)}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </Tree>
      </div>
    </div>
  );
}
