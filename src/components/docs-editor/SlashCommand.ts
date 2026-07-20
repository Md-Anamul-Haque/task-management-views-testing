import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { filterCommandItems, type CommandItem } from "./command-items";
import { SlashCommandList, type SlashCommandListHandle } from "./SlashCommandList";

const suggestion: Omit<SuggestionOptions<CommandItem>, "editor"> = {
  char: "/",
  startOfLine: false,
  items: ({ query }) => filterCommandItems(query),
  command: ({ editor, range, props }) => {
    props.command({ editor, range });
  },
  render: () => {
    let component: ReactRenderer<SlashCommandListHandle>;
    let popup: TippyInstance[];

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashCommandList, {
          props: { items: props.items, command: (item: CommandItem) => item.command({ editor: props.editor, range: props.range }) },
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy("body", {
          getReferenceClientRect: () => props.clientRect!() as DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate(props) {
        component.updateProps({
          items: props.items,
          command: (item: CommandItem) => item.command({ editor: props.editor, range: props.range }),
        });
        if (!props.clientRect) return;
        popup[0]?.setProps({ getReferenceClientRect: () => props.clientRect!() as DOMRect });
      },
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown(props) ?? false;
      },
      onExit() {
        popup[0]?.destroy();
        component.destroy();
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return { suggestion };
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
});
