import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnMeta, ColumnId } from "../types";

interface MoveTaskMenuProps {
  taskTitle: string;
  currentColumnId: ColumnId;
  columnOrder: ColumnId[];
  columns: Record<ColumnId, ColumnMeta>;
  onMove: (destinationColumnId: ColumnId) => void;
  onDelete: () => void;
}

/**
 * Every drag interaction on the board has a keyboard- and screen-reader-reachable
 * equivalent here, so moving a task never depends on pointer drag-and-drop.
 */
export function MoveTaskMenu({
  taskTitle,
  currentColumnId,
  columnOrder,
  columns,
  onMove,
  onDelete,
}: MoveTaskMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100"
          aria-label={`More actions for "${taskTitle}"`}
        >
          <MoreHorizontal className="size-3.5" />
        </Button>} />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to…</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {columnOrder.map((columnId) => (
              <DropdownMenuItem
                key={columnId}
                disabled={columnId === currentColumnId}
                onSelect={() => onMove(columnId)}
              >
                {columns[columnId].title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          className="text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="size-3.5" />
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
