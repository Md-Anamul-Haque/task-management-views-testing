# Task Board (Kanban view)

Production-ready board view built on `@atlaskit/pragmatic-drag-and-drop` and shadcn/ui —
drop into any Next.js + Tailwind + TypeScript app that already has shadcn set up.

## 1. Install dependencies

```bash
npm i @atlaskit/pragmatic-drag-and-drop \
      @atlaskit/pragmatic-drag-and-drop-hitbox \
      @atlaskit/pragmatic-drag-and-drop-auto-scroll \
      @atlaskit/pragmatic-drag-and-drop-flourish \
      tiny-invariant lucide-react
```

## 2. Add the required shadcn/ui components

```bash
npx shadcn@latest add avatar button dropdown-menu input skeleton tooltip
```

(If you don't already have `lib/utils.ts` with the `cn()` helper, `shadcn init` generates it —
this board imports it as `@/lib/utils`.)

## 3. Copy the files

```
types.ts                        -> project root (or merge into your existing types)
lib/mock-data.ts                -> lib/
lib/board-reducer.ts            -> lib/
lib/dnd-types.ts                -> lib/
lib/date.ts                     -> lib/
components/task-board.tsx       -> components/
components/board-column.tsx     -> components/
components/task-card.tsx        -> components/
components/priority-badge.tsx   -> components/
components/assignee-stack.tsx   -> components/
components/move-task-menu.tsx   -> components/
components/column-skeleton.tsx  -> components/
```

All imports use the `@/*` alias — adjust paths if your `tsconfig.json` uses a different one.

## 4. Render it

```tsx
// app/board/page.tsx
import { TaskBoard } from "@/components/task-board";

export default function BoardPage() {
  return (
    <div className="h-[calc(100vh-56px)]"> {/* give it an explicit height */}
      <TaskBoard />
    </div>
  );
}
```

The board needs a bounded height from its parent (it manages its own horizontal + per-column
vertical scrolling) — a flex/`h-screen` layout with a header above it works well.

## What's implemented

- **Drag to reorder** within a column and **drag across columns**, both via
  `@atlaskit/pragmatic-drag-and-drop`'s element adapter + hitbox closest-edge utilities.
- **Custom lifted drag preview** (`setCustomNativeDragPreview`) — a slightly tilted card clone,
  not the default browser ghost.
- **Colored drop-indicator line**, tinted per destination column's accent.
- **Auto-scroll** both horizontally (the board) and vertically (each column) while dragging near
  an edge.
- **Post-move flash** on the card that just landed, so a cross-column move is easy to track.
- **Keyboard/screen-reader parity**: every card has a "⋯ → Move to…" menu that performs the exact
  same action as a drag, so nothing on the board is drag-only.
- **`aria-live` announcements** on every move.
- **Loading skeleton** (simulated 500 ms — replace with your real fetch state) and an
  **empty-column state**.
- **Quick add**: the "+" in a column header opens an inline title field (Enter to add,
  Esc to cancel).

## Wiring to a real backend later

Everything mutates through `boardReducer` (`lib/board-reducer.ts`) via a handful of actions
(`reorder-column`, `move-task`, `add-task`, `remove-task`). To persist:

1. Keep the reducer as your optimistic local state.
2. In `task-board.tsx`, after each `dispatch(...)` call, fire the matching API request
   (e.g. `PATCH /tasks/:id { columnId, position }`).
3. On failure, dispatch the inverse action (or refetch) to roll back — there's no rollback
   logic included since it depends on your API's error shape; the dispatch call sites are
   already isolated in one file to make this a small, contained change.

## Notes / things to double-check against your setup

- `DropdownMenuItem`'s `variant="destructive"` prop only exists in newer shadcn versions, so the
  delete item uses an explicit `text-destructive` className instead — safe either way.
- Column lists use plain `overflow-y-auto` rather than shadcn's `ScrollArea`, intentionally —
  Radix's custom scrollbar thumb sits over the same pointer events the drag adapter listens to,
  and native scroll is one less variable while dragging.
- `reorderWithEdge`'s exact export path (`@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge`)
  has been stable across recent 1.x releases, but pin your installed version and check the
  changelog if you're upgrading pragmatic-drag-and-drop across a major version.
