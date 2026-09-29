import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type SectionHeaderProps = {
  id?: string;
  title: React.ReactNode;
  description?: string;
  action?: {label: string;to: string;};
};

export function SectionHeader({ id, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div>
        <h2 id={id} className="text-xl font-semibold tracking-title text-fg">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-fg-subtle">{description}</p>}
      </div>
      {action &&
      <Link
        to={action.to}
        className="group inline-flex shrink-0 items-center gap-1.5 rounded text-sm text-fg-subtle transition-colors duration-150 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
        
          {action.label}
          <ArrowRightIcon size={14} className="transition-transform duration-150 ease-cinema group-hover:translate-x-0.5" />
        </Link>
      }
    </div>);

}