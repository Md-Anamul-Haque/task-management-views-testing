import {
  ListChecks,
  LayoutDashboard,
  FileText,
  PenSquare,
  ClipboardList,
  MessageSquare,
  Table2,
  type LucideIcon,
} from "lucide-react";
import type { ListType } from "./types";

interface ListTypeMeta {
  label: string;
  icon: LucideIcon;
  defaultName: string;
}

/**
 * The 7 file types below cover the ClickUp views people reach for most and
 * are the cheapest to ship first. Easy to extend later (Gantt, Mind Map,
 * Calendar, Table, Whiteboard variants, etc.) — just add an entry here.
 */
export const LIST_TYPE_META: Record<ListType, ListTypeMeta> = {
  task_list: { label: "Task List", icon: ListChecks, defaultName: "New Task List" },
  dashboard: { label: "Dashboard", icon: LayoutDashboard, defaultName: "New Dashboard" },
  doc: { label: "Doc", icon: FileText, defaultName: "New Doc" },
  whiteboard: { label: "Whiteboard", icon: PenSquare, defaultName: "New Whiteboard" },
  form: { label: "Form", icon: ClipboardList, defaultName: "New Form" },
  chat: { label: "Chat", icon: MessageSquare, defaultName: "New Chat" },
  table: { label: "Table", icon: Table2, defaultName: "New Table" },
};

export const LIST_TYPE_ORDER: ListType[] = [
  "task_list",
  "dashboard",
  "doc",
  "table",
  "whiteboard",
  "form",
  "chat",
];
