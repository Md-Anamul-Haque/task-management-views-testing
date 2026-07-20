# Docs Editor + File Viewer — Setup

## 1. Install

```bash
# Editor core
npm install @tiptap/react @tiptap/core @tiptap/starter-kit @tiptap/suggestion @tiptap/pm

# Extensions used
npm install @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-image \
            @tiptap/extension-underline @tiptap/extension-task-list @tiptap/extension-task-item \
            @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell \
            @tiptap/extension-table-header @tiptap/extension-code-block-lowlight lowlight

# Slash command popup positioning
npm install tippy.js

# File viewer
npm install react-pdf

# Icons + typography styling for the document body
npm install lucide-react
npm install -D @tailwindcss/typography
```

Add the typography plugin to your Tailwind config:

```js
// tailwind.config.js
export default {
  plugins: [require("@tailwindcss/typography")],
};
```

## 2. Files

```
editor-extensions.ts   — the full extension list (StarterKit + tables, tasks, images, etc.)
command-items.ts         — slash-command definitions (Heading, List, Table, Image, ...)
SlashCommand.ts           — the Tiptap extension wiring '/' to the popup (built on @tiptap/suggestion)
SlashCommandList.tsx      — the popup menu UI, keyboard-navigable
BubbleToolbar.tsx          — floating format menu on text selection (bold/italic/link/...)
DocsEditor.tsx             — main component: title field, autosave, editor
PdfViewer.tsx               — react-pdf based viewer with page nav + zoom
ImageViewer.tsx              — hand-rolled wheel-zoom + drag-pan image viewer
FileViewer.tsx                — dispatches to the right viewer by mime type, with a download fallback
```

## 3. Usage

```tsx
import { DocsEditor } from "@/components/docs-editor/DocsEditor";
import { FileViewer } from "@/components/docs-editor/FileViewer";

// A doc page
export function DocPage({ doc }) {
  return <DocsEditor docId={doc.id} initialTitle={doc.title} initialContent={doc.content} />;
}

// A file attachment preview (e.g. clicking a PDF/image in a task)
export function AttachmentPreview({ file }) {
  return <FileViewer file={{ url: file.url, name: file.name, mimeType: file.mimeType }} height={640} />;
}
```

## 4. Why these specific choices

**Tiptap over Slate/Lexical.** Same underlying engine (ProseMirror) that
Notion and many production doc editors use. Its extension model matches
exactly what "add a feature = add an extension" needs, and TypeScript
support is first-class.

**Slash command built from scratch, not a third-party package.** Tiptap's
own official slash-command extension is explicitly marked
"not published — copy the source yourself" in their docs, and the
third-party npm alternatives are thinly maintained (single maintainer,
infrequent updates). Building it directly on `@tiptap/suggestion` — the
same primitive those packages wrap — means no dependency on an
unmaintained package, and full control over styling/behavior.

**react-pdf over rolling your own PDF.js integration.** It's the
de facto standard (1000+ dependents, actively maintained), and handles the
fiddly parts (worker setup, text layer, annotation layer) for you. One
important gotcha baked into `PdfViewer.tsx`: the PDF.js worker **must** be
configured in the same file where `<Document>`/`<Page>` are used — setting
it elsewhere can get silently overwritten due to module load order.

**Hand-rolled image viewer, not a library.** Wheel-zoom + drag-pan is
~80 lines of plain React state — not worth a dependency for.

## 5. Autosave

`DocsEditor` debounces saves by 800ms after the last keystroke (title or
body) and PATCHes `/api/tasks/${docId}`... wire the endpoint in `persist()`
inside `DocsEditor.tsx` to your real API. `editor.getJSON()` gives you
Tiptap's native JSON document format — store that (not HTML) so formatting
round-trips perfectly; render it back via the `content` prop on load.

## 6. Natural next additions (not included, to keep this shippable)

- **Comments/mentions** — `@tiptap/extension-mention` for @-mentioning
  teammates, plus a comments sidebar keyed by text selection ranges.
- **Real-time collaboration** — Tiptap's collaboration extensions pair with
  Yjs + a websocket provider (e.g. Hocuspocus) for Notion-style multiplayer
  editing. Meaningfully more infrastructure, so left out of this first pass.
- **Nested pages / doc-in-doc embeds** — would hook into the same sidebar
  tree from earlier (a "doc" list item could itself contain child docs).
- **DOCX/XLSX preview** in `FileViewer`'s fallback branch — typically
  requires a server-side conversion step (e.g. to PDF) before it can be
  previewed in-browser; out of scope for a client-only viewer.
