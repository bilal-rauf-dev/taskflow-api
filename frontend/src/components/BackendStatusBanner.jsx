import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { HAS_CONFIGURED_API } from '../api/config';

// Sits above the Login/Register forms. Stays invisible while a configured
// backend is reachable; otherwise explains why and offers Guest Mode as an
// immediate way forward instead of a dead form.
export default function BackendStatusBanner() {
  const status = useBackendStatus();
  const { enterGuestMode } = useAuth();
  const navigate = useNavigate();

  if (HAS_CONFIGURED_API && status !== 'unreachable') {
    return null;
  }

  const handleGuest = () => {
    enterGuestMode();
    toast.success('Continuing as Guest - your work is saved on this device only.');
    navigate('/dashboard');
  };

  const message = HAS_CONFIGURED_API
    ? "Can't reach the backend right now. You can still use TaskFlow locally."
    : 'This deployment has no backend configured. Use TaskFlow locally instead.';

  return (
    <div className="mb-5 flex flex-col items-start gap-3 rounded-xl border-2 border-dashed border-border-strong bg-accent-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-start gap-2 text-xs font-medium text-foreground-muted">
        <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-none text-warning" />
        <span>{message}</span>
      </p>
      <button
        type="button"
        onClick={handleGuest}
        className="qp-button-secondary shrink-0 gap-2 px-4 py-2 text-xs"
      >
        <SparklesIcon className="h-4 w-4" strokeWidth={2.5} />
        Continue as Guest
      </button>
    </div>
  );
}
