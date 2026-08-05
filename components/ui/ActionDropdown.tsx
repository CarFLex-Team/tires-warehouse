"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ReactElement, ReactNode } from "react";

export type ActionDropdownItem = {
  label: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

type ActionDropdownProps = {
  trigger: ReactElement;
  items: ActionDropdownItem[];
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
};

export default function ActionDropdown({
  trigger,
  items,
  align = "end",
  side = "bottom",
}: ActionDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={side}
          align={align}
          sideOffset={8}
          onClick={(event) => event.stopPropagation()}
          collisionPadding={12}
          className="z-50 min-w-32 rounded-md bg-white py-1 shadow-lg ring-1 ring-gray-300/50"
        >
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              disabled={item.disabled}
              onSelect={item.onSelect}
              className={`cursor-pointer px-4 py-2 text-sm outline-none
                focus:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50
                ${item.destructive ? "text-red-600 focus:bg-red-50 hover:bg-red-100" : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
