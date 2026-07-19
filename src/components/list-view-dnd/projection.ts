import type { FlatRow } from "./flatten";

/** Pixels of horizontal drag per depth level. Also used as the row's visual indent. */
export const INDENTATION_WIDTH = 20;

export interface Projection {
  depth: number;
  parentId: string | null;
  /** The sibling (at `depth`, under `parentId`) that the dragged row should land right after. `null` = first child / first root item. */
  previousSiblingId: string | null;
  isNestingPrevented?: boolean;
}

/**
 * Computes where a dragged row would land, given:
 *  - which row it's currently hovered over (`overId`, from dnd-kit's collision detection)
 *  - how far right/left the pointer has moved since drag start (`dragOffsetX`)
 *  - `effectiveMaxDepth` — the caller's business-rule ceiling for THIS specific
 *    drag (not just the tree's global max depth — see TaskListView for why
 *    a task that already has subtasks gets its own, shallower ceiling).
 *
 * Direction-aware insertion:
 *  - Dragging DOWN → the insertion point is AFTER the over row.
 *    `previousRow` = the over row (it will sit above the new position).
 *  - Dragging UP (or same position) → the insertion point is BEFORE the over row.
 *    `previousRow` = the row before the over row.
 *
 * This distinction is critical for the last-item case: without it, you can
 * never nest INTO the last visible row because the insertion point was always
 * placed above it, making its predecessor the parent candidate instead.
 *
 * The depth is clamped between what the row above allows (can't jump deeper
 * than "previous row's depth + 1") and what the row below requires (can't
 * be shallower than "next row's depth", or you'd float above nested items).
 */
export function getProjection(
  flatRows: FlatRow[],
  activeId: string,
  overId: string,
  dragOffsetX: number,
  effectiveMaxDepth: number,
  effectiveMinDepth: number = 0,
): Projection {
  const activeRow = flatRows.find((r) => r.task.id === activeId);
  if (!activeRow) {
    return { depth: 0, parentId: null, previousSiblingId: null };
  }

  // Exclude the row being dragged from neighbor calculations — its old
  // position shouldn't count as "the row above" or "the row below".
  const withoutActive = flatRows.filter((r) => r.task.id !== activeId);

  // Determine drag direction from the ORIGINAL (unfiltered) flat list.
  // This tells us whether the item is moving down or up in the list.
  const activeOrigIndex = flatRows.findIndex((r) => r.task.id === activeId);
  const overOrigIndex = flatRows.findIndex((r) => r.task.id === overId);

  // Use a higher resistance (e.g., 100px) so the user has to drag significantly
  // to the right or left to trigger a nesting/unnesting action.
  const DRAG_DEPTH_RESISTANCE = 150;
  const dragDepthDelta = Math.round(dragOffsetX / DRAG_DEPTH_RESISTANCE);

  let overIndex = withoutActive.findIndex((r) => r.task.id === overId);
  const isHoveringSelf = overIndex === -1;

  // If hovered over its own original slot (or lost), use its original index.
  if (isHoveringSelf) {
    overIndex = activeOrigIndex;
  }

  const isDraggingDown = activeOrigIndex < overOrigIndex;

  // previousRow = the row that will sit directly ABOVE the insertion point.
  // nextRow     = the row that will sit directly BELOW the insertion point.
  let previousRow: FlatRow | null;
  let nextRow: FlatRow | null;

  if (isDraggingDown) {
    // Dragging down → insert AFTER the over row.
    previousRow = withoutActive[overIndex] ?? null;
    nextRow = withoutActive[overIndex + 1] ?? null;
  } else {
    // Dragging up (or same position)
    if (!isHoveringSelf && dragDepthDelta > 0) {
      // If dragging UP over a different row, AND pulling right to indent, 
      // the user intends to drop INSIDE the row they are hovering over.
      // So we must insert AFTER the over row to become its child.
      previousRow = withoutActive[overIndex] ?? null;
      nextRow = withoutActive[overIndex + 1] ?? null;
    } else {
      // Otherwise, normal insert BEFORE the over row.
      previousRow = overIndex > 0 ? withoutActive[overIndex - 1] : null;
      nextRow = withoutActive[overIndex] ?? null;
    }
  }

  // If we are inserting at the very top (previousRow is null), but the item
  // MUST be inside a group (effectiveMinDepth > 0), force it into the first group.
  if (!previousRow && effectiveMinDepth > 0 && withoutActive.length > 0) {
    previousRow = withoutActive[0];
  }

  let depth = activeRow.depth + dragDepthDelta;
  const intendedDepth = depth;

  const maxPossibleDepth = previousRow ? previousRow.depth + 1 : 0;
  const minPossibleDepth = nextRow ? nextRow.depth : 0;

  depth = Math.max(depth, minPossibleDepth, effectiveMinDepth);
  depth = Math.min(depth, maxPossibleDepth, effectiveMaxDepth);

  const isNestingPrevented = intendedDepth > effectiveMaxDepth && effectiveMaxDepth < maxPossibleDepth;

  if (!previousRow || depth === 0) {
    // Inserting at root level. Walk backwards from the insertion point to
    // find the nearest root-level row — that's the correct previousSibling.
    let rootSiblingId: string | null = null;
    const scanEnd = isDraggingDown ? overIndex : overIndex - 1;
    for (let i = scanEnd; i >= 0; i--) {
      if (withoutActive[i].depth === 0) {
        rootSiblingId = withoutActive[i].task.id;
        break;
      }
    }
    return {
      depth: 0,
      parentId: null,
      previousSiblingId: rootSiblingId,
      isNestingPrevented,
    };
  }

  if (depth === previousRow.depth) {
    // Landing as a sibling right after previousRow, under the same parent.
    return { depth, parentId: previousRow.parentId, previousSiblingId: previousRow.task.id, isNestingPrevented };
  }

  if (depth === previousRow.depth + 1) {
    // Nesting inside previousRow, as its first child.
    return { depth, parentId: previousRow.task.id, previousSiblingId: null, isNestingPrevented };
  }

  // depth < previousRow.depth (forced outdent because of effectiveMaxDepth)
  // Walk backwards to find the nearest row at the same depth or shallower.
  const scanEnd = isDraggingDown ? overIndex : overIndex - 1;
  for (let i = scanEnd; i >= 0; i--) {
    const row = withoutActive[i];
    if (row.depth === depth) {
      return { depth, parentId: row.parentId, previousSiblingId: row.task.id, isNestingPrevented };
    }
    if (row.depth === depth - 1) {
      return { depth, parentId: row.task.id, previousSiblingId: null, isNestingPrevented };
    }
  }

  // Fallback (should not reach here if depth > 0)
  return { depth, parentId: null, previousSiblingId: null, isNestingPrevented };
}

