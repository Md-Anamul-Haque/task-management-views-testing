import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  todo: { bg: "bg-slate-100", text: "text-slate-600", label: "TO DO" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "IN PROGRESS" },
  in_review: { bg: "bg-purple-100", text: "text-purple-700", label: "REVIEW" },
  done: { bg: "bg-emerald-100", text: "text-emerald-700", label: "DONE" },
};

interface StatusSelectorProps {
  status: string;
  onChange?: (newStatus: string) => void;
  readOnly?: boolean;
}

export function StatusSelector({ status, onChange, readOnly }: StatusSelectorProps) {
  const currentStyle = statusStyles[status];

  if (readOnly) {
    return (
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${currentStyle ? `${currentStyle.bg} ${currentStyle.text}` : "bg-slate-100 text-slate-600"
          }`}
      >
        {currentStyle ? currentStyle.label : status.toUpperCase().replace("_", " ")}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded hover:opacity-80 transition-opacity">
          {currentStyle ? (
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${currentStyle.bg} ${currentStyle.text}`}
            >
              {currentStyle.label}
            </span>
          ) : (
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide bg-slate-100 text-slate-600">
              {status.toUpperCase().replace("_", " ")}
            </span>
          )}
        </button>} />
      <DropdownMenuContent align="start" className="w-[140px]">
        {Object.entries(statusStyles).map(([statusKey, style]) => (
          <DropdownMenuItem
            key={statusKey}
            onClick={(e) => {
              e.stopPropagation();
              // Delay the status change slightly so the DropdownMenu closing animation
              // can finish before the row is unmounted and moved to a new group.
              // This fixes the "flickering" or "buffering" feeling.
              setTimeout(() => {
                onChange?.(statusKey);
              }, 150);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className={`h-2 w-2 rounded-full ${style.bg
                .replace("bg-", "bg-")
                .replace("100", "500")}`}
            />
            <span className="text-xs font-medium">{style.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
