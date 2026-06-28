import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Cog6ToothIcon, BellIcon, SpeakerWaveIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    theme: 'warm',
    soundAlerts: true,
    emailAlerts: false
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem('taskflow_preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const handleToggle = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    localStorage.setItem('taskflow_preferences', JSON.stringify(updated));
    toast.success('Preference updated successfully');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile settings updated successfully');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-warm-terracotta">Configuration</span>
        <h1 className="text-2xl font-black text-warm-ink mt-1">Preferences & settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - profile overview */}
        <div className="md:col-span-1 rounded-3xl border border-warm-surface bg-white p-6 shadow-warm-md flex flex-col items-center text-center space-y-4">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 text-2xl font-bold text-white shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="font-bold text-warm-ink text-lg">{user?.name}</h2>
            <p className="text-xs text-warm-muted capitalize">{user?.role} Workspace</p>
          </div>
          <div className="w-full pt-4 border-t border-warm-surface text-left text-xs space-y-1 text-warm-muted">
            <p>Joined TaskFlow recently</p>
            <p className="truncate">Email: {user?.email}</p>
          </div>
        </div>

        {/* Right column - settings forms */}
        <div className="md:col-span-2 space-y-6">
          {/* App preferences */}
          <div className="rounded-3xl border border-warm-surface bg-white p-6 shadow-warm-md space-y-4">
            <h3 className="font-bold text-warm-ink flex items-center gap-2 border-b border-warm-surface pb-3">
              <PaintBrushIcon className="w-5 h-5 text-warm-terracotta" />
              Application Preferences
            </h3>

            <div className="divide-y divide-warm-surface text-sm">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-warm-ink">Sound Notifications</p>
                  <p className="text-xs text-warm-muted">Play a sound alert when Pomodoro countdown completes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('soundAlerts')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.soundAlerts ? 'bg-warm-terracotta' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.soundAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-warm-ink">Email Reminders</p>
                  <p className="text-xs text-warm-muted">Receive daily summary digests of upcoming task deadlines.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('emailAlerts')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.emailAlerts ? 'bg-warm-terracotta' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile mock form */}
          <div className="rounded-3xl border border-warm-surface bg-white p-6 shadow-warm-md space-y-4">
            <h3 className="font-bold text-warm-ink flex items-center gap-2 border-b border-warm-surface pb-3">
              <Cog6ToothIcon className="w-5 h-5 text-warm-terracotta" />
              Account Settings
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-warm-muted uppercase tracking-wider">Full Name</span>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-warm-canvas py-2.5 px-4 text-xs font-semibold outline-none focus:border-warm-amber focus:bg-white"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-warm-muted uppercase tracking-wider">Email Address</span>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    required
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-warm-canvas py-2.5 px-4 text-xs font-semibold outline-none disabled:opacity-50"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
