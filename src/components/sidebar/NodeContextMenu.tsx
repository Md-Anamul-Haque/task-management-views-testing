"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FolderPlus, FilePlus2, Pencil, Copy, Trash2, Star } from "lucide-react";
import { LIST_TYPE_META, LIST_TYPE_ORDER } from "./list-type-meta";
import type { ListType, SidebarNodeData } from "./types";

interface NodeContextMenuProps {
  node: SidebarNodeData;
  onAddFolder: () => void;
  onAddList: (listType: ListType) => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export function NodeContextMenu({
  node,
  onAddFolder,
  onAddList,
  onRename,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: NodeContextMenuProps) {
  const canContainChildren = node.kind === "space" || node.kind === "folder";
  // ClickUp doesn't nest a folder inside a folder — only a Space can hold one.
  const canAddFolder = node.kind === "space";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button type="button" onClick={(e) => e.stopPropagation()} className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 hover:bg-slate-200 group-hover:opacity-100 data-[state=open]:opacity-100"><MoreHorizontal className="h-4 w-4" /></button>} />
      <DropdownMenuContent align="start" className="w-48" onClick={(e) => e.stopPropagation()}>
        {canContainChildren && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Add file
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {LIST_TYPE_ORDER.map((type) => {
                const meta = LIST_TYPE_META[type];
                const Icon = meta.icon;
                return (
                  <DropdownMenuItem key={type} onClick={() => onAddList(type)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {meta.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {canAddFolder && (
          <DropdownMenuItem onClick={onAddFolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Add folder
          </DropdownMenuItem>
        )}
        {node.kind === "list" && (
          <DropdownMenuItem onClick={onToggleFavorite}>
            <Star className="mr-2 h-4 w-4" />
            {node.isFavorite ? "Remove from favorites" : "Add to favorites"}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
