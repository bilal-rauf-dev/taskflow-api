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
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative isolate overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="absolute left-[8%] top-24 h-72 w-72 rounded-full bg-accent-muted blur-3xl" />
        <div className="absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-[#f4f1eb] blur-3xl" />

        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-between rounded-lg border border-border bg-surface/95 p-6 shadow-lg sm:p-8 lg:p-10">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-accent text-white shadow-sm">
                <BoltIcon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-heading text-xl">TaskFlow</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/login" className="qp-button-secondary px-4 text-sm">
                Login
              </Link>
              <Link to="/register" className="qp-button px-4 text-sm">
                Get Started Free
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full bg-accent-muted px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Organize with confidence
              </p>
              <h1 className="qp-heading text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
                Manage your tasks smarter, faster, together.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-foreground-muted sm:text-lg">
                Plan work, assign roles, and keep everything moving with a clean, scalable dashboard built for modern teams.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className="qp-button px-6 text-sm">
                  Get Started Free
                </Link>
                <Link to="/login" className="qp-button-secondary px-6 text-sm">
                  Login
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-4 rounded-lg bg-accent-muted/70" />
              <div className="relative qp-card p-5 shadow-md sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Dashboard overview</p>
                    <p className="text-xs text-foreground-muted">Live task management view</p>
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full bg-success" aria-label="Live" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {['Active Sprint', '4 overdue items', 'Team throughput', '99.8% uptime'].map((item, index) => (
                    <div
                      key={item}
                      className="rounded-md border border-border bg-background p-4"
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Metric</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-border bg-accent-muted/45 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Release checklist</p>
                      <p className="text-xs text-foreground-muted">Design, API, testing, launch</p>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">82%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-border">
                    <div className="h-2 w-[82%] rounded-full bg-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="grid gap-4 pb-8 sm:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <article key={title} className="qp-card qp-card-interactive p-5">
                <div className="qp-icon-badge mb-4 h-10 w-10">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h2 className="font-heading text-xl text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">{description}</p>
              </article>
            ))}
          </section>

          <footer className="border-t border-border pt-6 text-center text-sm text-foreground-muted">
            Built by Bilal Rauf
          </footer>
        </div>
      </section>
    </main>
  );
}

export default Landing;
