import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bars3Icon, BoltIcon } from '@heroicons/react/24/outline';

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background lg:flex-row">
      {/* Mobile Top Bar Header */}
      <header className="flex h-16 w-full flex-shrink-0 items-center justify-between border-b-2 border-foreground bg-surface p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-foreground bg-accent text-xs text-white shadow-xs">
            <BoltIcon className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-heading text-lg tracking-tight text-foreground">TaskFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-full border-2 border-foreground bg-tertiary p-2 text-foreground shadow-xs transition hover:-translate-y-0.5"
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
            className="fixed inset-0 z-40 bg-foreground/45 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="relative h-full flex-1 overflow-y-auto bg-background focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
