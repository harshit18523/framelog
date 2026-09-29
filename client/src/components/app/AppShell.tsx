import React from 'react';
import { Outlet } from 'react-router-dom';
import { LogFilmDialog } from '../diary/LogFilmDialog';
import { MobileTabBar } from './MobileTabBar';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="min-h-screen w-full bg-canvas text-fg">
      <TopBar />
      <div className="mx-auto flex w-full max-w-[1520px]">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-28 lg:pb-16">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
      <LogFilmDialog />
    </div>);

}