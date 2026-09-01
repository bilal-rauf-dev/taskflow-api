import { useEffect, useState } from 'react';
import { API_ORIGIN, HAS_CONFIGURED_API } from '../api/config';

// Reports whether a real backend can actually be reached, so Login/Register
// can offer Guest Mode instead of a dead form. When no backend URL was
// configured at build time at all (a frontend-only deploy), this skips the
// network probe entirely and reports 'unreachable' immediately - there is
// nothing to check.
export function useBackendStatus() {
  const [status, setStatus] = useState(HAS_CONFIGURED_API ? 'checking' : 'unreachable');

  useEffect(() => {
    if (!HAS_CONFIGURED_API) return undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch(`${API_ORIGIN}/health`, { signal: controller.signal })
      .then((res) => setStatus(res.ok ? 'reachable' : 'unreachable'))
      .catch(() => setStatus('unreachable'))
      .finally(() => clearTimeout(timeoutId));

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  return status; // 'checking' | 'reachable' | 'unreachable'
}
