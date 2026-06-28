import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Bars3Icon, BoltIcon } from '@heroicons/react/24/outline';

export default function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-warm-canvas overflow-hidden flex-col lg:flex-row">
      {/* Mobile Top Bar Header */}
      <header className="flex items-center justify-between border-b border-warm-surface bg-white/80 p-4 backdrop-blur-md lg:hidden h-16 w-full flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 text-xs font-bold text-white">
            <BoltIcon className="h-4 w-4" />
          </div>
          <span className="font-black text-warm-ink tracking-tight text-sm">TaskFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-warm-surface text-warm-muted transition"
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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-warm-canvas relative focus:outline-none h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
