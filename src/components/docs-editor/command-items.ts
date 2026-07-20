import type { Editor, Range } from "@tiptap/core";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Table2,
  Code2,
  Quote,
  Minus,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";

export interface CommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  command: (props: { editor: Editor; range: Range }) => void;
}

export const commandItems: CommandItem[] = [
  {
    title: "Heading 1",
    description: "Big section heading",
    icon: Heading1,
    keywords: ["h1", "title", "heading"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    keywords: ["h2", "subtitle", "heading"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    keywords: ["h3", "heading"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Simple unordered list",
    icon: List,
    keywords: ["bullet", "ul", "list"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered, numbered list",
    icon: ListOrdered,
    keywords: ["ordered", "ol", "number"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Checkboxes for tracking to-dos",
    icon: ListTodo,
    keywords: ["todo", "task", "checkbox", "checklist"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Table",
    description: "3x3 table with header row",
    icon: Table2,
    keywords: ["table", "grid"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Code Block",
    description: "Syntax-highlighted code",
    icon: Code2,
    keywords: ["code", "snippet"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Quote",
    description: "Blockquote for callouts",
    icon: Quote,
    keywords: ["quote", "blockquote", "callout"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Divider",
    description: "Horizontal rule",
    icon: Minus,
    keywords: ["divider", "hr", "line", "separator"],
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Embed an image by URL",
    icon: ImageIcon,
    keywords: ["image", "picture", "photo", "embed"],
    command: ({ editor, range }) => {
      const url = window.prompt("Image URL");
      if (!url) return;
      editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
    },
  },
];

export function filterCommandItems(query: string): CommandItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return commandItems;
  return commandItems.filter(
    (item) => item.title.toLowerCase().includes(q) || item.keywords.some((k) => k.includes(q)),
  );
}
