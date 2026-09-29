import React from 'react';
import { motion } from 'framer-motion';

type TabItem<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  label: string;
};

export function Tabs<T extends string>({ items, value, onChange, layoutId, label }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="scrollbar-none -mb-px flex gap-7 overflow-x-auto">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap pb-3.5 pt-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:text-fg ${
            active ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'}`
            }>
            
            {item.label}
            {item.count != null &&
            <span className={`text-xs tabular-nums ${active ? 'text-fg-muted' : 'text-fg-faint'}`}>{item.count}</span>
            }
            {active &&
            <motion.span
              layoutId={layoutId}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gold" />

            }
          </button>);

      })}
    </div>);

}