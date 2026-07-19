import { Skeleton } from "@/components/ui/skeleton";

export function ColumnSkeleton() {
  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col gap-2 rounded-2xl bg-muted/40 p-3">
      <div className="mb-1 flex items-center gap-2">
        <Skeleton className="size-2 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-5 rounded-full" />
      </div>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}
