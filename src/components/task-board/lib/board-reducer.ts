import type { BoardState, ColumnId, Task } from "../types";

export type BoardAction =
  /**
   * `list` is the already-reordered array for the column (computed by the caller with
   * `reorderWithEdge`, which correctly accounts for the source item's own removal shift).
   * Passing the finished list — rather than raw indices — avoids duplicating that math here.
   */
  | { type: "reorder-column"; columnId: ColumnId; list: Task[] }
  | {
    type: "move-task";
    taskId: string;
    sourceColumnId: ColumnId;
    destinationColumnId: ColumnId;
    destinationIndex: number;
  }
  | { type: "add-task"; columnId: ColumnId; title: string }
  | { type: "remove-task"; taskId: string; columnId: ColumnId };

let nextTaskSeq = 1000;

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "reorder-column": {
      const { columnId, list } = action;
      return {
        ...state,
        tasksByColumn: { ...state.tasksByColumn, [columnId]: list },
      };
    }

    case "move-task": {
      const { taskId, sourceColumnId, destinationColumnId, destinationIndex } = action;

      const sourceList = [...state.tasksByColumn[sourceColumnId]];
      const sourceIndex = sourceList.findIndex((t) => t.id === taskId);
      if (sourceIndex === -1) return state;

      const [moving] = sourceList.splice(sourceIndex, 1);
      const movedTask: Task = { ...moving, columnId: destinationColumnId };

      // Same column: splice back in at the (already index-adjusted) destination.
      if (sourceColumnId === destinationColumnId) {
        const clampedIndex = Math.max(0, Math.min(destinationIndex, sourceList.length));
        sourceList.splice(clampedIndex, 0, movedTask);
        return {
          ...state,
          tasksByColumn: { ...state.tasksByColumn, [sourceColumnId]: sourceList },
        };
      }

      const destinationList = [...state.tasksByColumn[destinationColumnId]];
      const clampedIndex = Math.max(0, Math.min(destinationIndex, destinationList.length));
      destinationList.splice(clampedIndex, 0, movedTask);

      return {
        ...state,
        tasksByColumn: {
          ...state.tasksByColumn,
          [sourceColumnId]: sourceList,
          [destinationColumnId]: destinationList,
        },
      };
    }

    case "add-task": {
      const { columnId, title } = action;
      const trimmed = title.trim();
      if (!trimmed) return state;

      const newTask: Task = {
        id: `t-local-${nextTaskSeq++}`,
        title: trimmed,
        priority: "medium",
        assignees: [],
        subtasksDone: 0,
        subtasksTotal: 0,
        columnId,
      };

      return {
        ...state,
        tasksByColumn: {
          ...state.tasksByColumn,
          [columnId]: [...state.tasksByColumn[columnId], newTask],
        },
      };
    }

    case "remove-task": {
      const { taskId, columnId } = action;
      return {
        ...state,
        tasksByColumn: {
          ...state.tasksByColumn,
          [columnId]: state.tasksByColumn[columnId].filter((t) => t.id !== taskId),
        },
      };
    }

    default:
      return state;
  }
}
