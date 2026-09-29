import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { appNavigation } from '../../data/navigation';
import { isNavActive } from '../../utils/navigation';

export function MobileTabBar() {
  const { pathname, search } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl bg-surface-raised/80 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl lg:hidden">
      
      <ul className="grid grid-cols-5">
        {appNavigation.map((item) => {
          const active = isNavActive(item.id, pathname, search);
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-150 ${
                active ? 'text-fg' : 'text-fg-subtle'}`
                }>
                
                <Icon size={19} className={active ? 'text-gold' : ''} />
                {item.label}
              </Link>
            </li>);

        })}
      </ul>
    </nav>);

}