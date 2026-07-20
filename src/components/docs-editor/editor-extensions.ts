import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { SlashCommand } from "./SlashCommand";

const lowlight = createLowlight(common);

export const editorExtensions = [
  StarterKit.configure({
    // CodeBlockLowlight replaces the plain code block from StarterKit.
    codeBlock: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") return "Heading";
      return "Press '/' for commands…";
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: { class: "text-blue-600 underline underline-offset-2" },
  }),
  Image.configure({
    HTMLAttributes: { class: "rounded-lg border border-slate-200" },
  }),
  TaskList.configure({ HTMLAttributes: { class: "not-prose pl-1" } }),
  TaskItem.configure({ nested: true }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  CodeBlockLowlight.configure({ lowlight }),
  SlashCommand,
];
