import { TaskListView } from "@/components/list-view-dnd/TaskListView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { useState } from "react";
import { TaskBoard } from "@/components/task-board/components/task-board";

import { Button } from "./components/ui/button";

export function App() {
  const [view, setView] = useState<"list" | "board">("list");
  const [groupBy, setGroupBy] = useState<"none" | "status">("none");

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
        {view === "list" && (
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={() => setGroupBy(groupBy === "none" ? "status" : "none")}
          >
            {groupBy === "none" ? "Group by Status" : "Ungroup"}
          </Button>
        )}
      </aside>
      <main className="flex-1 overflow-hidden">
        {view === "list" ? (
          <TaskListView height={700} groupBy={groupBy} />
        ) : (
          <TaskBoard />
        )}
      </main>
    </div>
  )
}

export default App
