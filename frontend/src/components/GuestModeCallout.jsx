import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

// Self-contained "Continue as Guest" entry point: drop it into Landing,
// Login, or Register without those pages needing to know how Guest Mode
// works. Everything created in Guest Mode is saved to this browser only -
// no account and no backend required.
export default function GuestModeCallout({ className = '', children }) {
  const { enterGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleGuest = () => {
    enterGuestMode();
    toast.success('Continuing as Guest - your work is saved on this device only.');
    navigate('/dashboard');
  };

  return (
    <button type="button" onClick={handleGuest} className={className || 'qp-button-secondary gap-2'}>
      <SparklesIcon className="h-4 w-4" strokeWidth={2.5} />
      {children || 'Continue as Guest'}
    </button>
  );
}
