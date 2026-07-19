"use client";

import { useRef } from "react";
import type { NodeRendererProps } from "react-arborist";
import { ChevronRight, ChevronDown, Folder, FolderOpen, Star } from "lucide-react";
import { LIST_TYPE_META } from "./list-type-meta";
import { NodeContextMenu } from "./NodeContextMenu";
import type { ListType, SidebarNodeData } from "./types";

interface SidebarRowProps extends NodeRendererProps<SidebarNodeData> {
  onAddFolder: (parentId: string) => void;
  onAddList: (parentId: string, listType: ListType) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function SidebarRow({
  node,
  style,
  dragHandle,
  onAddFolder,
  onAddList,
  onRename,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}: SidebarRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isContainer = node.data.kind === "space" || node.data.kind === "folder";

  return (
    <div
      ref={dragHandle}
      style={style}
      onClick={() => isContainer && node.toggle()}
      className={`relative group flex h-full cursor-default items-center gap-1.5 rounded-md px-2 transition-colors ${node.willReceiveDrop
        ? "bg-blue-50/50 border border-b-0 border-blue-500/45"
        : node.isSelected
          ? "bg-blue-50"
          : "hover:bg-slate-50"
        }`}
    >
      {/* Expand / collapse — only spaces and folders can contain items */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-0"
        disabled={!isContainer}
        tabIndex={-1}
      >
        {isContainer ? (
          node.isOpen || node.willReceiveDrop ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )
        ) : null}
      </button>

      {/* Icon: colored avatar for Space, folder icon, or file-type icon */}
      {node.data.kind === "space" ? (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white ${node.willReceiveDrop ? "ring-2 ring-blue-400 ring-offset-1" : ""
            }`}
          style={{ backgroundColor: node.data.color ?? "#64748b" }}
        >
          {node.data.name.slice(0, 1).toUpperCase()}
        </span>
      ) : node.data.kind === "folder" ? (
        node.isOpen || node.willReceiveDrop ? (
          <FolderOpen
            className={`h-4 w-4 shrink-0 ${node.willReceiveDrop ? "text-blue-500" : "text-slate-400"}`}
          />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-slate-400" />
        )
      ) : (
        (() => {
          const Icon = LIST_TYPE_META[node.data.listType!].icon;
          return <Icon className="h-4 w-4 shrink-0 text-slate-400" />;
        })()
      )}

      {/* Name — plain text, or an input while renaming */}
      {node.isEditing ? (
        <input
          ref={inputRef}
          autoFocus
          defaultValue={node.data.name}
          onClick={(e) => e.stopPropagation()}
          onBlur={() => node.reset()}
          onKeyDown={(e) => {
            if (e.key === "Enter") node.submit((e.target as HTMLInputElement).value);
            if (e.key === "Escape") node.reset();
          }}
          className="h-6 flex-1 rounded border border-blue-400 bg-white px-1 text-sm outline-none"
        />
      ) : (
        <span
          className={`truncate text-sm ${node.data.kind === "space" ? "font-semibold text-slate-800" : "text-slate-700"}`}
        >
          {node.data.name}
        </span>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-0.5 pl-2">
        {node.data.isFavorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
        <NodeContextMenu
          node={node.data}
          onAddFolder={() => onAddFolder(node.data.id)}
          onAddList={(listType) => onAddList(node.data.id, listType)}
          onRename={() => node.edit()}
          onDuplicate={() => onDuplicate(node.data.id)}
          onDelete={() => onDelete(node.data.id)}
          onToggleFavorite={() => onToggleFavorite(node.data.id)}
        />
      </div>

      {/* Fake cursor overlay to simulate child insertion visually */}
      {node.willReceiveDrop && (
        <div className="pointer-events-none absolute -bottom-px left-18 right-1 z-10 h-0.5 rounded-full bg-blue-500">
          <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
}
