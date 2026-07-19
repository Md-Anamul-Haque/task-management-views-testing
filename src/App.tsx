import { TaskListView } from "@/components/list-view-dnd/TaskListView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useState } from "react";
import { BoardView } from "@/components/board/BoardView";
import type { Task } from "@/components/board/types";
import { Button } from "./components/ui/button";

export function App() {
  const [view, setView] = useState<"list" | "board">("list");

  const tasks: Task[] = [
    { id: "1", title: "Design onboarding flow", status: "todo", priority: "high", assignee: "Rafi", hasSubtask: true },
    { id: "2", title: "Fix virtualization jitter", status: "in_progress", priority: "medium" },
    { id: "3", title: "Write API docs", status: "done", priority: "low" },
  ];
  return (
    <div className="p-4 w-screen h-screen flex gap-4">
      <aside className="w-72">
        <Sidebar height={700} />
        <Button
          className="mt-4 w-full"
          onClick={() => setView(view === "list" ? "board" : "list")}
        >
          Switch to {view === "list" ? "Board" : "List"} View
        </Button>
      </aside>
      <main className="flex-1 overflow-hidden">
        {view === "list" ? (
          <TaskListView height={700} />
        ) : (
          <BoardView initialTasks={tasks} />
        )}
      </main>
    </div>
  )
}

export default App
