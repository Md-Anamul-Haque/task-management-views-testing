import type { TaskNodeData } from "./types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulates GET /tasks — top-level only, children null where hasSubtask is true. */
export async function fetchTasks(): Promise<TaskNodeData[]> {
  await delay(300);
  return [
    { id: "t1", title: "Launch marketing site", status: "in_progress", priority: "high", assignee: "Rafi", hasSubtask: true, children: null },
    { id: "t2", title: "Fix checkout bug", status: "todo", priority: "high", assignee: "Mim", hasSubtask: false, children: [] },
    { id: "t3", title: "Write Q3 report", status: "done", priority: "low", assignee: "Aria", hasSubtask: true, children: null },
    { id: "t4", title: "Set up CI pipeline", status: "todo", priority: "medium", hasSubtask: false, children: [] },
  ];
}

/** Simulates GET /tasks/:id/subtasks — called lazily on first expand. */
export async function fetchSubtasks(taskId: string): Promise<TaskNodeData[]> {
  await delay(400);
  const bySource: Record<string, TaskNodeData[]> = {
    t1: [
      { id: "t1-1", title: "Design landing page", status: "done", priority: "medium", hasSubtask: false, children: [] },
      { id: "t1-2", title: "Write homepage copy", status: "in_progress", priority: "medium", hasSubtask: false, children: [] },
    ],
    t3: [{ id: "t3-1", title: "Collect quarterly metrics", status: "done", priority: "low", hasSubtask: false, children: [] }],
  };
  return bySource[taskId] ?? [];
}
