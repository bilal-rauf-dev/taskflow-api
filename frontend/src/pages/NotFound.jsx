import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(31,41,55,0.16),_transparent_30%)]" />
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '36px 36px', animation: 'bg-shift 22s ease-in-out infinite' }} />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={index}
              className="absolute h-1 w-1 rounded-full bg-white/70"
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
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
          </defs>
          <circle cx="350" cy="210" r="160" fill="rgba(255,255,255,0.05)" />
          <circle cx="515" cy="105" r="6" fill="#fff" opacity="0.9" />
          <circle cx="160" cy="88" r="4" fill="#fff" opacity="0.8" />
          <circle cx="590" cy="250" r="3" fill="#fff" opacity="0.7" />
          <circle cx="110" cy="280" r="5" fill="#fff" opacity="0.6" />
          <path d="M145 330c40-18 75-12 105 8" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round" />
          <path d="M475 335c46-16 86-9 125 14" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round" />
          <g transform="translate(210 80)">
            <ellipse cx="140" cy="180" rx="90" ry="104" fill="url(#astroGradient)" opacity="0.92" />
            <ellipse cx="140" cy="160" rx="56" ry="66" fill="white" />
            <ellipse cx="140" cy="160" rx="38" ry="44" fill="#dbeafe" />
            <circle cx="120" cy="154" r="6" fill="#1f2937" />
            <circle cx="160" cy="154" r="6" fill="#1f2937" />
            <path d="M124 176c10 10 30 10 40 0" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M94 178c-28 20-42 54-38 88" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M186 178c28 20 42 54 38 88" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M118 252c-36 30-44 66-24 102" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M162 252c36 30 44 66 24 102" stroke="url(#astroGradient)" strokeWidth="18" strokeLinecap="round" fill="none" />
            <path d="M92 210c-26 0-58 20-82 56" stroke="url(#astroGradient)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <path d="M188 210c26 0 58 20 82 56" stroke="url(#astroGradient)" strokeWidth="16" strokeLinecap="round" fill="none" />
            <circle cx="42" cy="266" r="18" fill="white" opacity="0.8" />
            <circle cx="258" cy="266" r="18" fill="white" opacity="0.8" />
            <rect x="116" y="280" width="48" height="82" rx="22" fill="white" opacity="0.92" />
          </g>
        </svg>

        <p className="text-7xl font-black tracking-tight text-transparent sm:text-8xl" style={{ background: 'linear-gradient(90deg, #0f172a, #1f2937, #334155)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
          404
        </p>
        <h1 className="mt-4 text-3xl font-black sm:text-5xl">Houston, we have a problem</h1>
        <p className="mt-3 max-w-lg text-sm text-white/75 sm:text-base">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/25 transition hover:scale-[1.02]"
        >
          Take me home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;