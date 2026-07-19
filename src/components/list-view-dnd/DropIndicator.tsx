"use client";

export function DropIndicator({ top, left }: { top: number; left: number }) {
  return (
    <div
      style={{ position: "absolute", top, left, right: 8 }}
      className="pointer-events-none z-10 h-[2px] rounded-full bg-blue-500"
    >
      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500" />
    </div>
  );
}
