# Board View — Setup

## 1. Install dependencies

```bash
npm install @atlaskit/pragmatic-drag-and-drop \
            @atlaskit/pragmatic-drag-and-drop-hitbox \
            @atlaskit/pragmatic-drag-and-drop-react-drop-indicator \
            @tanstack/react-virtual \
            lucide-react
```

shadcn/ui `Card` and `Badge` are assumed to already be added
(`npx shadcn@latest add card badge`). Tailwind must be configured.

## 2. Files

- `types.ts` — Task / Column type definitions
- `TaskCard.tsx` — draggable, reorderable card (drag handle + closest-edge drop indicator)
- `BoardColumn.tsx` — one status column, virtualized card list, drop target for
  empty space / empty columns
- `BoardView.tsx` — owns task state, listens for drops via `monitorForElements`,
  reorders/reparents tasks, renders the 3 columns

## 3. Usage

```tsx
import { BoardView } from "@/components/board/BoardView";
import type { Task } from "@/components/board/types";

const tasks: Task[] = [
  { id: "1", title: "Design onboarding flow", status: "todo", priority: "high", assignee: "Rafi", hasSubtask: true },
  { id: "2", title: "Fix virtualization jitter", status: "in_progress", priority: "medium" },
  { id: "3", title: "Write API docs", status: "done", priority: "low" },
];

export default function Page() {
  return (
    <div className="h-screen">
      <BoardView initialTasks={tasks} />
    </div>
  );
}
```

## 4. Notes on behavior

- **Board view never shows subtasks.** `hasSubtask` only renders a small
  layers icon on the card — no subtask cards, no counts.
- **Drag across columns** changes `status`; **drag within a column**
  reorders using the closest-edge drop indicator (top/bottom line).
- **Virtualization**: each column virtualizes its own card list independently
  via `@tanstack/react-virtual`. Pragmatic drag and drop is virtualization-safe —
  a card being dragged can scroll out of view and unmount mid-drag without
  breaking the drag session, because state lives in `monitorForElements`,
  not on the card DOM node.
- **API call**: `BoardView.tsx` has a commented `fetch(...)` placeholder inside
  `onDrop` — wire this to your real endpoint. The UI update is optimistic
  (state updates immediately, before the request resolves).
- **Adjust `estimateSize`** in `BoardColumn.tsx` (currently `92`) to match your
  actual card height for smoother initial scroll positioning.
