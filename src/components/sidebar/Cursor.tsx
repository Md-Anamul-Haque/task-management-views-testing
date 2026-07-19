"use client";

import type { CursorProps } from "react-arborist";

export function Cursor({ top, left, indent }: CursorProps) {
  return (
    <div
      style={{ top, left: left + indent }}
      className="pointer-events-none absolute right-2 z-10 h-[2px] rounded-full bg-blue-500"
    >
      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-500" />
    </div>
  );
}
