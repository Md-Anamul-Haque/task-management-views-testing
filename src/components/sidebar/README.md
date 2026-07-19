# ClickUp-style Sidebar — Setup

## 1. Install dependencies

```bash
npm install react-arborist lucide-react
npx shadcn@latest add dropdown-menu input button
```

## 2. File structure

```
src/components/sidebar/
├── types.ts             # SidebarNodeData, NodeKind, ListType
├── list-type-meta.ts     # icon + label + default name per file type
├── mock-data.ts          # seed tree — swap for a real fetch
├── sidebar-utils.ts       # createNode / find / remove / insert / update (immutable)
├── NodeContextMenu.tsx    # "..." menu: add folder/file, rename, duplicate, delete, favorite
├── SidebarRow.tsx         # row renderer — icon, inline rename, context menu
├── Cursor.tsx / DragPreview.tsx  # drag feedback (shared pattern with the list view)
└── Sidebar.tsx            # <Tree> wiring: hierarchy rule, search, all the handlers
```

## 3. Usage

```tsx
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AppShell() {
  return (
    <aside className="w-72">
      <Sidebar height={700} />
    </aside>
  );
}
```

## 4. The naming question — "Space" vs. something else

Kept `kind: "space"` as the internal/type name since it's a neutral, generic
term — nothing in the code assumes ClickUp's branding. Rename the **label**
shown to users freely (`"Workspace"`, `"Team"`, `"Area"`, whatever fits your
product) by changing the copy in `Sidebar.tsx` (the "Add space" button title)
— the `kind` string itself doesn't need to change.

## 5. The core rule: Space can never become a child

Everything about the hierarchy lives in one function, `disableDrop` in
`Sidebar.tsx`:

```ts
if (data.kind === "space") return parentKind !== "root";   // spaces: root only
if (data.kind === "folder") return parentKind !== "space";  // folders: directly under a space
return parentKind !== "space" && parentKind !== "folder";   // lists: under space or folder
```

- A Space dragged anywhere with a non-null parent is rejected — it can only
  reorder among other root-level Spaces.
- A Folder can only land directly inside a Space (ClickUp doesn't nest a
  folder inside a folder — kept out to stay simple; add a `"folder"` branch
  here later if you need it).
- A List (file) can land inside a Space or a Folder, matching ClickUp,
  where files don't have to live inside a folder.

## 6. File types included (and why these seven)

`Task List`, `Dashboard`, `Doc`, `Table`, `Whiteboard`, `Form`, `Chat` — these
are the ClickUp view types people reach for constantly and each is just an
icon + label entry in `list-type-meta.ts`. Add more (Gantt, Calendar, Mind
Map, Time Tracking) the same way — no other code changes needed.

## 7. Other ClickUp sidebar behavior included because it was cheap to add

- **Search/filter** — uses react-arborist's built-in `searchTerm` +
  `searchMatch` props. No extra library, just a controlled input.
- **Inline rename** — click "Rename" or double-click behavior can be wired
  to `node.edit()`; the row swaps to an `<input>`, `Enter` commits via
  `node.submit(value)`, `Escape`/blur cancels via `node.reset()`.
- **Favorites** — a boolean flag + star icon toggle. A dedicated "Favorites"
  section at the top of the sidebar (pinned, flattened list of favorited
  items) is a natural next step — just filter `data` recursively for
  `isFavorite` and render a second, non-draggable `<Tree>` above this one.
- **Duplicate** — deep-ish clone via `crypto.randomUUID()` for a new id.

## 8. Worth adding later (skipped here to keep this shippable)

- **Space color/icon picker** — currently a fixed rotating palette; swap for
  a real color-picker popover.
- **Drag-across-space restriction** — right now a Folder/List can be dragged
  into *any* Space. If you want files to stay within their original Space,
  add a check in `disableDrop` comparing the dragged node's ancestor Space
  id to the destination's.
- **Permissions** (private Space, guest access) — needs a data model change
  (a `visibility` field) plus real auth, out of scope for the UI layer alone.
- **Nested folders** — one extra `parentKind !== "space" && parentKind !== "folder"`
  branch in `disableDrop` if your product ever needs it.
