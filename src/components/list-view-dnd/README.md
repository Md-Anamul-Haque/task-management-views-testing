# Custom List View — dnd-kit + tanstack-virtual

## 1. Install

```bash
npm install @dnd-kit/core @tanstack/react-virtual lucide-react
npx shadcn@latest add badge
```

Note: only `@dnd-kit/core` is needed — not `@dnd-kit/sortable`. This
implementation uses the low-level `useDraggable` + `useDroppable` hooks
directly rather than `SortableContext`, because the sortable package's
automatic sibling-reflow animation is built for flat-list reordering and
actively fights a tree's horizontal nesting gesture. All reorder/reparent
logic here is done manually in `onDragEnd`, which gives full control over
exactly this kind of drag.

## 2. Files

```
types.ts            — TaskNodeData
mock-api.ts          — fetchTasks / fetchSubtasks (swap for real endpoints)
tree-utils.ts         — findNode / removeNode / insertNode / updateChildren
flatten.ts            — nested tree → flat visible rows (respects expand state)
projection.ts          — THE core algorithm: horizontal offset → target depth/parent
TaskRow.tsx            — row renderer (draggable handle + droppable zone)
DropIndicator.tsx        — the blue line showing exactly where + how deep it'll land
DragOverlayCard.tsx      — floating "ghost" that follows the cursor
TaskListView.tsx          — wires dnd-kit + tanstack-virtual + all business rules
```

## 3. Usage

```tsx
import { TaskListView } from "@/components/list-view-dnd/TaskListView";

export default function Page() {
  return <TaskListView height={640} />;
}
```

## 4. How the horizontal-nesting gesture actually works

This is the part that react-arborist and headless-tree couldn't do —
deciding nesting from **how far right you drag**, not just which row you're
vertically hovering over. `projection.ts` is the whole trick:

1. `closestCenter` (dnd-kit's built-in collision detection) tells us which
   row (`overId`) the pointer is vertically nearest to.
2. `event.delta.x`, tracked in `onDragMove`, tells us how far the pointer
   has moved horizontally since the drag started.
3. `dragOffsetX / INDENTATION_WIDTH`, rounded, becomes a depth delta —
   drag right past one indent's width (28px) and the target depth goes up
   by one level; drag left, it goes down.
4. That raw depth is then **clamped**: it can never be deeper than
   "the row above's depth + 1" (you can't skip a level), never shallower
   than "the row below's depth" (or you'd float above where you visually
   are), and never past `effectiveMaxDepth`.

This clamping is exactly the algorithm from dnd-kit's own well-known
"Sortable Tree" example — adapted here to a flat, virtualized list instead
of a fully rendered tree.

## 5. The two business rules, and where they live

**Max depth (task → subtask, nothing deeper).** `MAX_DEPTH = 1` in
`TaskListView.tsx`, passed into `getProjection` as the depth ceiling.

**A task with existing subtasks can never become a subtask.** This is
*not* a post-drop rejection — it's baked into the drag itself:

```ts
const effectiveMaxDepth = activeHasSubtasks ? activeRow.depth : MAX_DEPTH;
```

If the dragged task already has children, its ceiling for *this drag* is
capped at its own current depth (0). Since depth can't rise above that, the
drop-indicator will never even show it landing inside another task — the
UI is honest about the constraint while you're still dragging, not just on
release.

## 6. Server persistence

`onDragEnd` applies the move optimistically (`setData`), then fires:

```ts
fetch(`/api/tasks/${activeId}`, {
  method: "PATCH",
  body: JSON.stringify({ parentId, previousSiblingId }),
});
```

If the request fails, the tree rolls back to the pre-drag snapshot. Adjust
the payload shape (e.g. send an absolute `position` instead of
`previousSiblingId`) to match whatever your backend expects for ordering.

## 7. Virtualization notes

- Row height is fixed (`ROW_HEIGHT = 44`) — no per-row measurement, which
  keeps the virtualizer cheap to recompute during drag.
- `TaskRow` is wrapped in `React.memo` so dragging one row doesn't
  re-render every other visible row.
- The drop-indicator's position is computed from
  `rowVirtualizer.getVirtualItems()` directly, so it stays correct even
  as rows scroll in and out of the rendered window.
- `DragOverlay` renders the floating preview in a portal, decoupled from
  the virtualized list — dragging never causes the list itself to reflow.

## 8. Known simplification

Only a single row can be dragged at a time (no multi-select drag). Extending
to multi-select would mean adjusting `removeNode`/`insertNode` calls in
`onDragEnd` to loop over multiple ids, same pattern as the earlier
react-arborist version.
