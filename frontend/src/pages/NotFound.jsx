import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(43,78,255,0.08),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(43,78,255,0.04),_transparent_30%)]" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(20,23,31,0.12) 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-accent/40"
              style={{
                left: `${(index * 7) % 100}%`,
                top: `${(index * 11) % 100}%`,
                animation: `pulse-soft ${2 + (index % 4)}s ease-in-out infinite`,
                opacity: 0.5 + (index % 3) * 0.2
              }}
            />
          ))}
        </div>

        <svg viewBox="0 0 700 420" className="mb-8 w-full max-w-2xl drop-shadow-2xl" role="img" aria-label="Lost astronaut illustration">
          <defs>
            <linearGradient id="astroGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2B4EFF" />
              <stop offset="100%" stopColor="#6476FF" />
            </linearGradient>
          </defs>
          <circle cx="350" cy="210" r="160" fill="#EEF1FF" />
          <circle cx="515" cy="105" r="6" fill="#2B4EFF" opacity="0.9" />
          <circle cx="160" cy="88" r="4" fill="#2B4EFF" opacity="0.8" />
          <circle cx="590" cy="250" r="3" fill="#2B4EFF" opacity="0.7" />
          <circle cx="110" cy="280" r="5" fill="#2B4EFF" opacity="0.6" />
          <path d="M145 330c40-18 75-12 105 8" stroke="#D8D7D2" strokeWidth="4" strokeLinecap="round" />
          <path d="M475 335c46-16 86-9 125 14" stroke="#D8D7D2" strokeWidth="4" strokeLinecap="round" />
          <g transform="translate(210 80)">
            <ellipse cx="140" cy="180" rx="90" ry="104" fill="url(#astroGradient)" opacity="0.92" />
            <ellipse cx="140" cy="160" rx="56" ry="66" fill="white" />
            <ellipse cx="140" cy="160" rx="38" ry="44" fill="#EEF1FF" />
            <circle cx="120" cy="154" r="6" fill="#14171F" />
            <circle cx="160" cy="154" r="6" fill="#14171F" />
            <path d="M124 176c10 10 30 10 40 0" stroke="#14171F" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M94 178c-28 20-42 54-38 88" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M186 178c28 20 42 54 38 88" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M118 252c-36 30-44 66-24 102" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M162 252c36 30 44 66 24 102" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M92 210c-26 0-58 20-82 56" stroke="url(#astroGradient)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M188 210c26 0 58 20 82 56" stroke="url(#astroGradient)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <circle cx="42" cy="266" r="18" fill="#FFFFFF" opacity="0.9" />
            <circle cx="258" cy="266" r="18" fill="#FFFFFF" opacity="0.9" />
            <rect x="116" y="280" width="48" height="82" rx="22" fill="#FFFFFF" opacity="0.92" />
          </g>
        </svg>

        <p className="qp-heading text-8xl tracking-tight text-accent sm:text-9xl">
          404
        </p>
        <h1 className="qp-heading mt-4 text-4xl sm:text-6xl">Houston, we have a problem</h1>
        <p className="mt-3 max-w-lg text-sm text-foreground-muted sm:text-base">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="qp-button mt-8 px-6 py-3.5 text-sm"
        >
          Take me home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
