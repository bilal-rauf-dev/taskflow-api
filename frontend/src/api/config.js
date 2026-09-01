const configuredOrigin = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ORIGIN = configuredOrigin.replace(/\/$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

// True only when a backend URL was actually configured at build time. When
// it's false (e.g. a frontend-only Vercel deploy with no VITE_API_URL), the
// app treats itself as having no backend to talk to at all, instead of
// silently trying (and failing) to reach the http://localhost:5000 fallback
// above - see Guest Mode in AuthContext/Login/Register/Landing.
export const HAS_CONFIGURED_API = Boolean(import.meta.env.VITE_API_URL);
