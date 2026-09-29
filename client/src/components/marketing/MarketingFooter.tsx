import React from 'react';
import { footerColumns } from '../../data/marketing';
import { Logo } from '../brand/Logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-subtle">
            A home for every film you’ve loved, hated, and can’t stop thinking about.
          </p>
        </div>
        {footerColumns.map((column) =>
        <nav key={column.title} aria-label={column.title}>
            <p className="text-sm font-medium text-fg">{column.title}</p>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) =>
            <li key={link}>
                  <a href="#" className="text-sm text-fg-subtle transition-colors duration-150 hover:text-fg">
                    {link}
                  </a>
                </li>
            )}
            </ul>
          </nav>
        )}
      </div>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 border-t border-line px-6 py-6 text-xs text-fg-faint sm:flex-row sm:justify-between">
        <p>© 2026 FrameLog Inc. Made for the last row of the cinema.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-fg-muted">Privacy</a>
          <a href="#" className="hover:text-fg-muted">Terms</a>
          <a href="#" className="hover:text-fg-muted">Cookies</a>
        </div>
      </div>
    </footer>);

}