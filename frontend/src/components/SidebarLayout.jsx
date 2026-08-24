import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bars3Icon, BoltIcon } from '@heroicons/react/24/outline';

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden flex-col lg:flex-row">
      {/* Mobile Top Bar Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface p-4 lg:hidden h-16 w-full flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-accent text-xs text-white shadow-xs">
            <BoltIcon className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-lg tracking-tight text-foreground">TaskFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-sm p-2 text-foreground-muted transition hover:bg-accent-muted hover:text-accent"
          aria-label="Open sidebar menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </header>

      {/* Main Layout Workspace Wrapper */}
      <div className="flex flex-1 overflow-hidden relative h-full w-full">
        {/* Persistent Desktop Sidebar / Absolute Mobile Drawer Overlay */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Dynamic Mobile click-out backdrop overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/25 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background relative focus:outline-none h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
