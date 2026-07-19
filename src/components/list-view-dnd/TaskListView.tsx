"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  MeasuringStrategy,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DragCancelEvent,
} from "@dnd-kit/core";
import { useVirtualizer } from "@tanstack/react-virtual";
import { fetchTasks, fetchSubtasks } from "./mock-api";
import { removeNode, insertNode, updateChildren, findNode } from "./tree-utils";
import { flattenVisible } from "./flatten";
import { getProjection, INDENTATION_WIDTH } from "./projection";
import { TaskRow } from "./TaskRow";
import { DropIndicator } from "./DropIndicator";
import { DragOverlayCard } from "./DragOverlayCard";
import type { TaskNodeData } from "./types";
import type { Projection } from "./projection";

/**
 * 0 = task, 1 = subtask — nothing nests deeper.
 * Separately: a task that already has its own subtasks can never become a
 * subtask itself. This is enforced by capping `effectiveMaxDepth` to that
 * task's own current depth for the duration of its drag (see below), rather
 * than as a post-hoc check — so the drop-indicator honestly reflects what's
 * allowed while you're still dragging, instead of only rejecting on drop.
 */
const MAX_DEPTH = 1;
const ROW_HEIGHT = 44;

/**
 * Disable droppable re-measuring while a drag is active — otherwise dnd-kit
 * measures every droppable on every move frame, which causes layout thrash
 * and visible flicker in the overlay/indicator.
 */
const MEASURING_CONFIG = {
  droppable: { strategy: MeasuringStrategy.BeforeDragging },
};

interface TaskListViewProps {
  height?: number;
  className?: string;
}

export function TaskListView({ height = 560, className = "" }: TaskListViewProps) {
  const [data, setData] = useState<TaskNodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const [activeId, setActiveId] = useState<string | null>(null);

  // ── High-frequency drag values live in refs, NOT state ──────────────
  // `overId` and `dragOffsetX` change on every mousemove pixel. Storing
  // them as `useState` caused a full React re-render cascade (flatRows →
  // projection → indicatorPosition → virtualizer) on every single frame,
  // which is the root cause of the overlay/indicator flicker ("lafalafi").
  //
  // Instead we store them in refs and manually compute the projection
  // inside a `requestAnimationFrame` callback, then write the result to
  // a single state (`projectionState`) — one setState per frame at most.
  const overIdRef = useRef<string | null>(null);
  const dragOffsetXRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // The only drag-related state that triggers renders:
  const [projectionState, setProjectionState] = useState<Projection | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTasks().then((tasks) => {
      if (cancelled) return;
      setData(tasks);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const flatRows = useMemo(() => flattenVisible(data, expanded), [data, expanded]);

  // Keep a ref mirror of flatRows so the rAF callback always reads the
  // latest value without needing it in a dependency array.
  const flatRowsRef = useRef(flatRows);
  flatRowsRef.current = flatRows;

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    getItemKey: (index) => flatRows[index].task.id,
  });

  const handleToggle = useCallback(
    async (id: string) => {
      const task = findNode(data, id);
      if (!task || task.children !== null) {
        setExpanded((prev) => {
          const next = new Set(prev);
          next.has(id) ? next.delete(id) : next.add(id);
          return next;
        });
        return;
      }
      setLoadingIds((prev) => new Set(prev).add(id));
      setExpanded((prev) => new Set(prev).add(id));
      const subtasks = await fetchSubtasks(id);
      setData((prev) => updateChildren(prev, id, subtasks));
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [data],
  );

  // A task that already has subtasks can't be dragged any deeper than it
  // already is — this is what stops it from ever landing inside another task.
  const activeRow = useMemo(() => flatRows.find((r) => r.task.id === activeId) ?? null, [flatRows, activeId]);
  const effectiveMaxDepth = useMemo(() => {
    if (!activeRow) return MAX_DEPTH;
    const activeHasSubtasks = Array.isArray(activeRow.task.children) && activeRow.task.children.length > 0;
    return activeHasSubtasks ? activeRow.depth : MAX_DEPTH;
  }, [activeRow]);

  // Keep a ref mirror so the rAF callback can read the latest value.
  const effectiveMaxDepthRef = useRef(effectiveMaxDepth);
  effectiveMaxDepthRef.current = effectiveMaxDepth;

  // ── Batched projection update via requestAnimationFrame ─────────────
  // Instead of setState on every mousemove, we schedule a single rAF.
  // Multiple moves within the same frame are coalesced into one update.
  const scheduleProjectionUpdate = useCallback(
    (currentActiveId: string | null) => {
      if (rafRef.current !== null) return; // already scheduled
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const oid = overIdRef.current;
        const offset = dragOffsetXRef.current;
        if (!currentActiveId || !oid) {
          setProjectionState(null);
          return;
        }
        const proj = getProjection(
          flatRowsRef.current,
          currentActiveId,
          oid,
          offset,
          effectiveMaxDepthRef.current,
        );
        setProjectionState(proj);
      });
    },
    [], // refs don't change — no deps needed
  );

  // Clean up any pending rAF on unmount.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Where to draw the drop-line: just below whichever row the projection
  // says is the "previous sibling" (or the new parent, when nesting as a
  // first child) — reusing the same reference the actual insert will use.
  const indicatorPosition = useMemo(() => {
    if (!projectionState) return null;
    const refId = projectionState.previousSiblingId ?? projectionState.parentId;
    if (refId === null) return { top: 4, left: 8 };
    const virtualItem = rowVirtualizer.getVirtualItems().find((v) => flatRows[v.index].task.id === refId);
    if (!virtualItem) return null;
    return { top: virtualItem.start + virtualItem.size, left: projectionState.depth * INDENTATION_WIDTH + 8 };
  }, [projectionState, rowVirtualizer, flatRows]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // ── Drag event handlers ─────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);
    overIdRef.current = null;
    dragOffsetXRef.current = 0;
    setProjectionState(null);
  }

  // `onDragMove` fires on every pointer move — only update the offset ref.
  function handleDragMove(event: DragMoveEvent) {
    dragOffsetXRef.current = event.delta.x;
    scheduleProjectionUpdate(event.active.id as string);
  }

  // `onDragOver` fires when the collision-detected target changes — this
  // is the correct place to update `overId`, not `onDragMove`.
  function handleDragOver(event: DragOverEvent) {
    overIdRef.current = (event.over?.id as string) ?? null;
    scheduleProjectionUpdate(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    // Cancel any pending rAF — we'll compute the final projection
    // synchronously from the event's own data, not from stale refs.
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const finalOverId = (event.over?.id as string) ?? overIdRef.current;
    const finalOffsetX = event.delta.x;

    if (activeId && finalOverId) {
      const finalProjection = getProjection(flatRows, activeId, finalOverId, finalOffsetX, effectiveMaxDepth);
      const { parentId, previousSiblingId } = finalProjection;
      let previousTree: TaskNodeData[] = [];

      setData((prev) => {
        previousTree = prev;
        const { tree: withoutActive, removed } = removeNode(prev, activeId);
        if (!removed) return prev;

        const siblingArray = parentId ? findNode(withoutActive, parentId)?.children ?? [] : withoutActive;
        const insertIndex = previousSiblingId
          ? siblingArray.findIndex((t) => t.id === previousSiblingId) + 1
          : 0;

        return insertNode(withoutActive, parentId, insertIndex, removed);
      });

      if (parentId) {
        setExpanded((prev) => new Set(prev).add(parentId));
      }

      fetch(`/api/tasks/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, previousSiblingId }),
      }).catch(() => setData(previousTree));
    }

    resetDragState();
  }

  function handleDragCancel(_event: DragCancelEvent) {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    resetDragState();
  }

  function resetDragState() {
    setActiveId(null);
    overIdRef.current = null;
    dragOffsetXRef.current = 0;
    setProjectionState(null);
  }

  const activeTask = activeId ? findNode(data, activeId) : null;

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className={`flex items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-400 ${className}`}
      >
        Loading tasks…
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={MEASURING_CONFIG}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={`rounded-xl border border-slate-200 bg-white p-1 ${className}`}>
        <div ref={scrollRef} style={{ height, overflow: "auto", position: "relative" }}>
          <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const { task, depth } = flatRows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TaskRow
                    task={task}
                    depth={depth}
                    isExpanded={expanded.has(task.id)}
                    isLoadingChildren={loadingIds.has(task.id)}
                    isReceivingDrop={projectionState?.parentId === task.id}
                    onToggle={handleToggle}
                  />
                </div>
              );
            })}
            {indicatorPosition && <DropIndicator top={indicatorPosition.top} left={indicatorPosition.left} />}
          </div>
        </div>
      </div>

      {/*
        <DragOverlay> doesn't move in the DOM tree by itself — it renders
        exactly where it's written in JSX. If ANY ancestor between here and
        <body> has `transform`, `filter`, `perspective`, or
        `will-change: transform` (a layout shell, a shadcn Dialog/Sheet
        wrapper, a leftover animation class, etc.), that ancestor becomes the
        CSS containing block for `position: fixed`, and the overlay renders
        relative to IT instead of the viewport — which looks exactly like
        "overlay shows in the wrong place". Portaling straight to <body>
        sidesteps this entirely, confirmed as the standard fix by dnd-kit's
        own maintainers.
      */}
      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay dropAnimation={null}>
            {activeTask ? <DragOverlayCard task={activeTask} /> : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
