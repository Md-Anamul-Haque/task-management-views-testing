import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-rose-100 text-rose-700 border-rose-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

interface PrioritySelectorProps {
  priority?: string;
  onChange?: (newPriority: string) => void;
  readOnly?: boolean;
}

export function PrioritySelector({ priority, onChange, readOnly }: PrioritySelectorProps) {
  if (readOnly) {
    if (!priority) return <span className="text-xs text-slate-400">-</span>;
    return (
      <Badge
        variant="outline"
        className={`h-[18px] border px-1.5 py-0 text-[9px] font-bold tracking-wider ${priorityStyles[priority]}`}
      >
        {priority.toUpperCase()}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded hover:opacity-80 transition-opacity">
          {priority ? (
            <Badge
              variant="outline"
              className={`h-[18px] border px-1.5 py-0 text-[9px] font-bold tracking-wider ${priorityStyles[priority]}`}
            >
              {priority.toUpperCase()}
            </Badge>
          ) : (
            <span className="text-xs text-slate-400 px-2 py-0.5 border border-dashed border-slate-300 rounded hover:bg-slate-50 transition-colors">
              Set priority
            </span>
          )}
        </button>} />
      <DropdownMenuContent align="start" className="w-[130px]">
        {Object.entries(priorityStyles).map(([prioKey]) => (
          <DropdownMenuItem
            key={prioKey}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(prioKey);
            }}
            className="cursor-pointer text-xs font-medium"
          >
            {prioKey.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
