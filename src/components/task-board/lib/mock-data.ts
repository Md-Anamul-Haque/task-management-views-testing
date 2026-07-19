import type { Assignee, BoardState, ColumnId, Task } from "../types";

const people: Record<string, Assignee> = {
  anamul: { id: "anamul", name: "Anamul Haque", initials: "AH" },
  rafi: { id: "rafi", name: "Rafi Ahmed", initials: "RA" },
  nusrat: { id: "nusrat", name: "Nusrat Jahan", initials: "NJ" },
  tanvir: { id: "tanvir", name: "Tanvir Islam", initials: "TI" },
};

function task(partial: Omit<Task, "columnId"> & { columnId: ColumnId }): Task {
  return partial;
}

export const initialColumnOrder: ColumnId[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
];

export const initialColumns: BoardState["columns"] = {
  todo: { id: "todo", title: "To Do", accent: "slate" },
  in_progress: { id: "in_progress", title: "In Progress", accent: "indigo" },
  in_review: { id: "in_review", title: "In Review", accent: "violet" },
  done: { id: "done", title: "Done", accent: "emerald" },
};

export const initialTasksByColumn: Record<ColumnId, Task[]> = {
  todo: [
    task({
      id: "t-1",
      title: "Design workspace switcher for multi-team accounts",
      priority: "high",
      dueDate: "2026-07-24",
      assignees: [people.nusrat],
      subtasksDone: 0,
      subtasksTotal: 4,
      columnId: "todo",
    }),
    task({
      id: "t-2",
      title: "Draft pricing page copy for the launch",
      priority: "medium",
      dueDate: "2026-07-29",
      assignees: [people.tanvir],
      subtasksDone: 1,
      subtasksTotal: 3,
      columnId: "todo",
    }),
    task({
      id: "t-3",
      title: "Research keyboard-only navigation patterns for the board",
      priority: "low",
      assignees: [],
      subtasksDone: 0,
      subtasksTotal: 0,
      columnId: "todo",
    }),
  ],
  in_progress: [
    task({
      id: "t-4",
      title: "Build recurring task engine (daily / weekly / custom)",
      priority: "urgent",
      dueDate: "2026-07-20",
      assignees: [people.anamul, people.rafi],
      subtasksDone: 3,
      subtasksTotal: 6,
      columnId: "in_progress",
    }),
    task({
      id: "t-5",
      title: "Wire up realtime presence indicators on cards",
      priority: "medium",
      dueDate: "2026-07-26",
      assignees: [people.rafi],
      subtasksDone: 2,
      subtasksTotal: 2,
      columnId: "in_progress",
    }),
  ],
  in_review: [
    task({
      id: "t-6",
      title: "Fix invoice PDF export losing table borders",
      priority: "high",
      dueDate: "2026-07-21",
      assignees: [people.tanvir],
      subtasksDone: 2,
      subtasksTotal: 2,
      columnId: "in_review",
    }),
  ],
  done: [
    task({
      id: "t-7",
      title: "Migrate auth sessions to rotating refresh tokens",
      priority: "high",
      dueDate: "2026-07-15",
      assignees: [people.anamul],
      subtasksDone: 5,
      subtasksTotal: 5,
      columnId: "done",
    }),
    task({
      id: "t-8",
      title: "Ship dark mode for the settings panel",
      priority: "low",
      dueDate: "2026-07-12",
      assignees: [people.nusrat, people.rafi],
      subtasksDone: 3,
      subtasksTotal: 3,
      columnId: "done",
    }),
  ],
};
