import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Option<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  label: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  label
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-white/[0.04] p-1 ring-1 ring-inset ring-line">
      {options.map((option) => {
        const active = option.id === value;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={`relative inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 ${active ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{
                  duration: 0.22,
                  ease: [0.23, 1, 0.32, 1]
                }}
                className="absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-inset ring-line-strong"
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {Icon && <Icon size={14} />}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}