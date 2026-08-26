import React from 'react';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-16 text-foreground">
      <span className="shape shape-circle left-[8%] top-[12%] hidden h-24 w-24 bg-tertiary sm:block" aria-hidden="true" />
      <span className="shape shape-square bottom-[14%] right-[9%] hidden h-20 w-20 bg-quaternary sm:block" aria-hidden="true" />
      <span className="shape shape-triangle right-[18%] top-[16%] hidden sm:block" aria-hidden="true" />

      <section className="playful-panel relative w-full max-w-2xl px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="absolute -left-6 -top-6 grid h-16 w-16 -rotate-12 place-items-center rounded-full border-2 border-foreground bg-secondary text-white shadow-pop">
          <MagnifyingGlassIcon className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <p className="font-heading text-8xl font-extrabold leading-none text-accent sm:text-9xl">404</p>
        <div className="mx-auto mt-4 h-3 w-48 rounded-full bg-tertiary" />
        <h1 className="qp-heading mt-8 text-4xl sm:text-5xl">This task wandered off.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-6 text-foreground-muted sm:text-base">
          The page you were looking for is not on this board. Let&apos;s get you back to somewhere productive.
        </p>
        <Link to="/dashboard" className="qp-button mt-8 gap-3 px-7 py-3.5 text-sm">
          <ArrowLeftIcon className="h-5 w-5" strokeWidth={2.5} />
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
