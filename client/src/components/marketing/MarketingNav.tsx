import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { ButtonLink } from '../ui/Button';

const links = [
{ label: 'Features', href: '#features' },
{ label: 'Community', href: '#community' },
{ label: 'Pro', href: '#join' }];


export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-200 ${
      scrolled ? 'border-line bg-canvas/70 backdrop-blur-xl' : 'border-transparent bg-transparent'}`
      }>
      
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[1200px] items-center px-6">
        <Logo />
        <ul className="ml-12 hidden items-center gap-8 md:flex">
          {links.map((link) =>
          <li key={link.label}>
              <a href={link.href} className="text-sm text-fg-muted transition-colors duration-150 hover:text-fg">
                {link.label}
              </a>
            </li>
          )}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg sm:block">
            Sign in
          </Link>
          <ButtonLink to="/register" size="sm" className="h-9 px-4">
            Get started
          </ButtonLink>
        </div>
      </nav>
    </header>);

}