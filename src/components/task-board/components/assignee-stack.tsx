import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Assignee } from "../types";

const MAX_VISIBLE = 3;

export function AssigneeStack({ assignees }: { assignees: Assignee[] }) {
  if (assignees.length === 0) return null;

  const visible = assignees.slice(0, MAX_VISIBLE);
  const overflow = assignees.length - visible.length;

  return (
    <div className="flex -space-x-2" role="group" aria-label="Assignees">
      {visible.map((person) => (
        <Tooltip key={person.id}>
          <TooltipTrigger render={
            <Avatar className="size-6 border-2 border-card ring-0">
              <AvatarImage src={person.avatarUrl} alt="" />
              <AvatarFallback className="text-[10px]">{person.initials}</AvatarFallback>
            </Avatar>} />
          <TooltipContent side="top">{person.name}</TooltipContent>
        </Tooltip>
      ))}
      {overflow > 0 && (
        <Tooltip>
          <TooltipTrigger render={
            <span className="flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-medium text-muted-foreground">
              +{overflow}
            </span>} />
          <TooltipContent side="top">
            {assignees.slice(MAX_VISIBLE).map((p) => p.name).join(", ")}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
