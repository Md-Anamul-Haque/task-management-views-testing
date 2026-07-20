"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { CommandItem } from "./command-items";

interface SlashCommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export interface SlashCommandListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandList = forwardRef<SlashCommandListHandle, SlashCommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-64 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-400 shadow-lg">
          No results
        </div>
      );
    }

    return (
      <div className="w-72 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => selectItem(index)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors ${
                index === selectedIndex ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-800">{item.title}</span>
                <span className="block truncate text-xs text-slate-400">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  },
);

SlashCommandList.displayName = "SlashCommandList";
