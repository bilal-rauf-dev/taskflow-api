import React from 'react';
import { Link } from 'react-router-dom';
import { LockClosedIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Secure Authentication',
    description: 'JWT-based auth with protected routes and safe session handling.',
    Icon: LockClosedIcon
  },
  {
    title: 'Role-Based Access',
    description: 'Admins and users see exactly the controls and data they need.',
    Icon: ShieldCheckIcon
  },
  {
    title: 'Real-Time CRUD',
    description: 'Create, update, and delete tasks quickly with a polished workflow.',
    Icon: BoltIcon
  }
];

function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.45),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(147,51,234,0.35),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.25),_transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(17,24,39,0.75))]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col justify-between rounded-[0.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8 lg:p-10">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-sm">
                <BoltIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-wide">TaskFlow</p>
                <p className="text-xs text-white/70">Primetrade.ai Internship Assignment</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/login" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]">
                Get Started Free
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/85">
                Premium task management
              </p>
              <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                Manage your tasks smarter, faster, together.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
                Plan work, assign roles, and keep everything moving with a clean, scalable dashboard built for modern teams.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/25 transition hover:scale-[1.02]">
                  Get Started Free
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15">
                  Login
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-4 rounded-[0.5rem] bg-gradient-to-br from-slate-950/20 via-gray-850/10 to-slate-900/20 blur-2xl" />
              <div className="relative rounded-[0.5rem] border border-white/10 bg-slate-950/60 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Dashboard overview</p>
                    <p className="text-xs text-white/55">Live task management view</p>
                  </div>
                  <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {['Active Sprint', '4 overdue items', 'Team throughput', '99.8% uptime'].map((item, index) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Metric</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/20 via-gray-850/10 to-slate-900/15 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Release checklist</p>
                      <p className="text-xs text-white/60">Design, API, testing, launch</p>
                    </div>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">82%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-[82%] rounded-full bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="grid gap-4 pb-8 sm:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15">
                <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 p-3 text-white shadow-lg">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">{description}</p>
              </article>
            ))}
          </section>

          <footer className="border-t border-white/10 pt-6 text-center text-sm text-white/70">
            Built for Primetrade.ai Internship Assignment
          </footer>
        </div>
      </section>
    </main>
  );
}

export default Landing;
