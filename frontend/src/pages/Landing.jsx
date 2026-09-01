import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import GuestModeCallout from '../components/GuestModeCallout';

const features = [
  {
    title: 'Secure by default',
    description: 'Protected sessions and role-aware workspaces keep the right tasks with the right people.',
    Icon: LockClosedIcon,
    color: 'bg-accent',
    shadow: 'shadow-[7px_7px_0_#F3E8FF]'
  },
  {
    title: 'Built for every role',
    description: 'Focused user views and powerful admin controls share one clear, friendly workflow.',
    Icon: ShieldCheckIcon,
    color: 'bg-secondary',
    shadow: 'shadow-[7px_7px_0_#FCE7F3]'
  },
  {
    title: 'Momentum in real time',
    description: 'Create, move, discuss, and complete work while every relevant screen stays in sync.',
    Icon: BoltIcon,
    color: 'bg-tertiary',
    shadow: 'shadow-[7px_7px_0_#FEF3C7]'
  }
];

function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="shape shape-circle -left-8 top-40 hidden h-12 w-12 bg-secondary lg:block" />
        <div className="shape shape-square right-4 top-32 hidden h-9 w-9 bg-quaternary lg:block" />

        <header className="flex items-center justify-between py-6 sm:py-8">
          <Link to="/" className="wiggle-hover flex items-center gap-3" aria-label="TaskFlow home">
            <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-foreground bg-accent text-white shadow-pop">
              <BoltIcon className="h-6 w-6" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-2xl font-extrabold tracking-tight">TaskFlow</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Account navigation">
            <GuestModeCallout className="min-h-11 px-3 text-sm font-semibold text-foreground-muted transition hover:text-accent" />
            <Link to="/login" className="qp-button-secondary min-h-11 px-4 text-sm sm:px-5">Sign in</Link>
            <Link to="/register" className="qp-button min-h-11 px-4 text-sm sm:px-5">Start free</Link>
          </nav>
        </header>

        <section className="grid min-h-[74vh] items-center gap-16 py-14 lg:grid-cols-2 lg:py-20">
          <div className="relative z-10">
            <div className="absolute -left-20 -top-16 -z-10 hidden h-80 w-80 rounded-full border-2 border-foreground bg-tertiary lg:block" />
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] shadow-[3px_3px_0_#1E293B]">
              <SparklesIcon className="h-4 w-4 text-accent" strokeWidth={2.5} />
              Work can feel lighter
            </p>
            <h1 className="qp-heading max-w-2xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Make progress feel <span className="relative inline-block text-accent">playful<span className="absolute -bottom-2 left-0 h-2 w-full rounded-full bg-secondary" /></span>, not painful.
            </h1>
            <p className="mt-7 max-w-xl text-base font-medium leading-7 text-foreground-muted sm:text-lg">
              Plan the work, move it forward, and celebrate what gets done—all in one colorful, role-aware workspace.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link to="/register" className="qp-button group gap-3 px-7 py-3.5">
                Get started free
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-foreground">
                  <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2.5} />
                </span>
              </Link>
              <Link to="/login" className="qp-button-secondary px-7 py-3.5">I have an account</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-foreground-muted">
              {['No credit card', 'Fast setup', 'Real-time updates', 'Try before you sign up'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-foreground bg-quaternary text-foreground">
                    <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="dot-field absolute -right-10 -top-10 h-40 w-40 rounded-lg opacity-30" />
            <div className="shape shape-triangle -left-8 top-20 hidden lg:block" />
            <div className="playful-panel rotate-[1.5deg] p-4 sm:p-6">
              <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full border-2 border-foreground bg-secondary" />
                  <span className="h-4 w-4 rounded-full border-2 border-foreground bg-tertiary" />
                  <span className="h-4 w-4 rounded-full border-2 border-foreground bg-quaternary" />
                </div>
                <span className="rounded-full bg-accent-muted px-3 py-1 text-xs font-bold text-accent">LIVE BOARD</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ['TO DO', 'bg-tertiary', ['Plan launch', 'Write brief']],
                  ['DOING', 'bg-accent', ['Build flow']],
                  ['DONE', 'bg-quaternary', ['Team kickoff', 'Map goals']]
                ].map(([label, color, tasks]) => (
                  <div key={label} className="rounded-md border-2 border-foreground bg-background p-2.5 sm:p-3">
                    <div className={`mb-3 rounded-full border-2 border-foreground ${color} px-2 py-1 text-center text-[9px] font-extrabold tracking-wider ${label === 'DOING' ? 'text-white' : 'text-foreground'}`}>
                      {label}
                    </div>
                    <div className="space-y-2">
                      {tasks.map((task, index) => (
                        <div key={task} className={`rounded-sm border-2 border-foreground bg-white p-2 shadow-[2px_2px_0_#1E293B] ${index % 2 ? '-rotate-1' : 'rotate-1'}`}>
                          <div className="mb-2 h-1.5 w-2/3 rounded-full bg-border-strong" />
                          <p className="text-[9px] font-bold leading-tight sm:text-[11px]">{task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-md border-2 border-foreground bg-accent-muted p-3">
                <div>
                  <p className="text-xs font-bold">Weekly momentum</p>
                  <p className="text-[10px] text-foreground-muted">8 tasks completed</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-foreground bg-secondary font-heading text-lg font-extrabold text-white shadow-[2px_2px_0_#1E293B]">82%</span>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-4 rotate-6 rounded-md border-2 border-foreground bg-tertiary px-4 py-2 font-heading text-sm font-extrabold shadow-pop sm:right-4">
              LOOKING GOOD! ✦
            </div>
          </div>
        </section>

        <section className="relative py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Everything in its happy place</p>
            <h2 className="qp-heading mt-3 text-4xl sm:text-5xl">Serious tools. Zero corporate gloom.</h2>
            <p className="mt-4 text-foreground-muted">The structure your team needs, wrapped in an interface people actually enjoy opening.</p>
          </div>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <svg className="absolute left-[16%] right-[16%] top-10 hidden h-20 w-2/3 md:block" viewBox="0 0 800 100" fill="none" aria-hidden="true">
              <path d="M0 65C130 5 240 90 390 42S650 4 800 56" stroke="#1E293B" strokeWidth="2" strokeDasharray="8 10" />
            </svg>
            {features.map(({ title, description, Icon, color, shadow }, index) => (
              <article key={title} className={`qp-card qp-card-interactive relative p-6 pt-10 ${index === 1 ? 'md:mt-6' : ''} ${shadow}`}>
                <div className={`absolute -top-6 left-6 grid h-14 w-14 place-items-center rounded-full border-2 border-foreground ${color} text-white shadow-pop`}>
                  <Icon className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground-muted">0{index + 1}</p>
                <h3 className="font-heading text-2xl font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-foreground-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative mb-20 overflow-hidden rounded-lg border-2 border-foreground bg-accent px-6 py-12 text-white shadow-[8px_8px_0_#FBBF24] sm:px-12 sm:py-16">
          <div className="shape shape-circle -right-10 -top-12 h-40 w-40 bg-secondary" />
          <div className="shape shape-square -bottom-8 left-12 h-20 w-20 bg-quaternary" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">Ready when you are</p>
              <h2 className="qp-heading mt-3 text-4xl sm:text-5xl">Turn that task pile into progress.</h2>
            </div>
            <Link to="/register" className="qp-button-secondary shrink-0 gap-3 px-7 py-3.5">
              Start your workspace <ArrowRightIcon className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t-2 border-foreground py-8 text-sm font-semibold text-foreground-muted sm:flex-row">
          <span className="font-heading text-lg font-extrabold text-foreground">TaskFlow</span>
          <span>Built with focus, color, and a little bit of bounce.</span>
        </footer>
      </div>
    </main>
  );
}

export default Landing;
