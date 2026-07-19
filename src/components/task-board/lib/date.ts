const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export interface DueDateInfo {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
}

/**
 * Formats an ISO date string relative to "now" for compact display on a card.
 * Falls back gracefully — never throws on a malformed date.
 */
export function formatDueDate(iso: string | undefined, now: Date = new Date()): DueDateInfo | null {
  if (!iso) return null;
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return null;

  const today = startOfDay(now);
  const dueDay = startOfDay(due);
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / DAY_MS);

  if (diffDays === 0) return { label: "Today", isOverdue: false, isToday: true };
  if (diffDays === 1) return { label: "Tomorrow", isOverdue: false, isToday: false };
  if (diffDays === -1) return { label: "Yesterday", isOverdue: true, isToday: false };
  if (diffDays < -1) return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isToday: false };
  if (diffDays > 1 && diffDays <= 6) return { label: `In ${diffDays}d`, isOverdue: false, isToday: false };

  return {
    label: due.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    isOverdue: false,
    isToday: false,
  };
}
