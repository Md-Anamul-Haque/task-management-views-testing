import type { SidebarNodeData } from "./types";

export const initialSidebarData: SidebarNodeData[] = [
  {
    id: "space-1",
    name: "Product",
    kind: "space",
    color: "#7c5cff",
    children: [
      {
        id: "folder-1",
        name: "Sprint Planning",
        kind: "folder",
        children: [
          { id: "list-1", name: "Sprint 24 Tasks", kind: "list", listType: "task_list" },
          { id: "list-2", name: "Sprint Retro Doc", kind: "list", listType: "doc" },
        ],
      },
      { id: "list-3", name: "Roadmap", kind: "list", listType: "table" },
      { id: "list-4", name: "Team Dashboard", kind: "list", listType: "dashboard", isFavorite: true },
      // another folder with no child
      {
        id: "folder-3",
        name: "Empty Folder",
        kind: "folder",
        children: [],
      },
    ],
  },
  {
    id: "space-2",
    name: "Marketing",
    kind: "space",
    color: "#ff6b6b",
    children: [
      { id: "list-5", name: "Campaign Brief", kind: "list", listType: "doc" },
      {
        id: "folder-2",
        name: "Launch Q3",
        kind: "folder",
        children: [{ id: "list-6", name: "Launch Checklist", kind: "list", listType: "task_list" }],
      },
    ],
  },
];
