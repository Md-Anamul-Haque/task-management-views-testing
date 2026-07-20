"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { editorExtensions } from "./editor-extensions";
import { BubbleToolbar } from "./BubbleToolbar";

interface DocsEditorProps {
  docId: string;
  initialTitle?: string;
  initialContent?: JSONContent;
  /** Called after a successful autosave — wire this to your own toast/indicator if you want one. */
  onSaved?: () => void;
}

const AUTOSAVE_DELAY_MS = 800;

export function DocsEditor({ docId, initialTitle = "", initialContent, onSaved }: DocsEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContent ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl min-h-[60vh]",
      },
    },
    onUpdate: ({ editor }) => {
      scheduleAutosave(title, editor.getJSON());
    },
  });

  const persist = useCallback(
    async (nextTitle: string, content: JSONContent) => {
      setSaveState("saving");
      try {
        await fetch(`/api/docs/${docId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nextTitle, content }),
        });
        setSaveState("saved");
        onSaved?.();
      } catch {
        setSaveState("idle");
      }
    },
    [docId, onSaved],
  );

  function scheduleAutosave(nextTitle: string, content: JSONContent) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => persist(nextTitle, content), AUTOSAVE_DELAY_MS);
  }

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleAutosave(e.target.value, editor.getJSON());
          }}
          placeholder="Untitled"
          className="w-full border-none text-4xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
        />
        <span className="shrink-0 pl-4 text-xs text-slate-400">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </span>
      </div>

      <BubbleToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
