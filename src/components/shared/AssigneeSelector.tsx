import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DUMMY_ASSIGNEES = [
  "John Doe",
  "Jane Smith",
  "Alice Johnson",
  "Bob Williams",
];

interface AssigneeSelectorProps {
  assignee?: string;
  onChange?: (newAssignee: string) => void;
  readOnly?: boolean;
}

export function AssigneeSelector({ assignee, onChange, readOnly }: AssigneeSelectorProps) {
  if (readOnly) {
    if (!assignee) return <span className="text-[11px] text-slate-400">Unassigned</span>;
    return (
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
          {assignee.slice(0, 2).toUpperCase()}
        </span>
        <span className="text-xs text-slate-600 truncate">{assignee}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded hover:opacity-80 transition-opacity w-full text-left">
          {assignee ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
                {assignee.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs text-slate-600 truncate">{assignee}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50"></span>
              <span className="text-[11px] text-slate-400">Assign</span>
            </div>
          )}
        </button>} />
      <DropdownMenuContent align="start" className="w-[160px]">
        {DUMMY_ASSIGNEES.map((name) => (
          <DropdownMenuItem
            key={name}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(name);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
              {name.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-xs font-medium text-slate-700">{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
