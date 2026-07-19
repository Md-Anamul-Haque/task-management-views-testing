import { ArrowUp, ArrowDown, ChevronsUp, Equal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority } from "../types";

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; icon: React.ElementType; className: string }
> = {
  urgent: {
    label: "Urgent",
    icon: ChevronsUp,
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  high: {
    label: "High",
    icon: ArrowUp,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  medium: {
    label: "Medium",
    icon: Equal,
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  low: {
    label: "Low",
    icon: ArrowDown,
    className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, icon: Icon, className } = PRIORITY_CONFIG[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
