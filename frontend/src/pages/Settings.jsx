import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Cog6ToothIcon, BellIcon, SpeakerWaveIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';

export default function Settings() {
  const { user, updateSession } = useAuth();
  const [preferences, setPreferences] = useState({
    theme: 'warm',
    soundAlerts: true,
    emailAlerts: false
  });
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const savedPrefs = localStorage.getItem('taskflow_preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const handleToggle = (key) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    localStorage.setItem('taskflow_preferences', JSON.stringify(updated));
    toast.success('Preference updated successfully');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const response = await api.put('/auth/me', { name: name.trim() });
      const { token, user: updatedUser } = response.data.data;
      updateSession(token, updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Unable to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Configuration</span>
        <h1 className="qp-heading mt-1 text-4xl text-foreground">Preferences & settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - profile overview */}
        <div className="qp-card md:col-span-1 flex flex-col items-center space-y-4 p-6 text-center shadow-sm">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-accent font-heading text-3xl text-white shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="font-heading text-2xl text-foreground">{user?.name}</h2>
            <p className="text-xs text-foreground-muted capitalize">{user?.role} Workspace</p>
          </div>
          <div className="w-full space-y-1 border-t border-border pt-4 text-left text-xs text-foreground-muted">
            <p>Joined TaskFlow recently</p>
            <p className="truncate">Email: {user?.email}</p>
          </div>
        </div>

        {/* Right column - settings forms */}
        <div className="md:col-span-2 space-y-6">
          {/* App preferences */}
          <div className="qp-card space-y-4 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 border-b border-border pb-3 font-heading text-2xl text-foreground">
              <PaintBrushIcon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Application Preferences
            </h3>

            <div className="divide-y divide-border text-sm">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Sound Notifications</p>
                  <p className="text-xs text-foreground-muted">Play a sound alert when Pomodoro countdown completes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('soundAlerts')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.soundAlerts ? 'bg-accent' : 'bg-border-strong'
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
                  <p className="font-semibold text-foreground">Email Reminders</p>
                  <p className="text-xs text-foreground-muted">Receive daily summary digests of upcoming task deadlines.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('emailAlerts')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.emailAlerts ? 'bg-accent' : 'bg-border-strong'
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
          <div className="qp-card space-y-4 p-6 shadow-sm">
            <h3 className="flex items-center gap-2 border-b border-border pb-3 font-heading text-2xl text-foreground">
              <Cog6ToothIcon className="h-5 w-5 text-accent" strokeWidth={1.5} />
              Account Settings
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Full Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="qp-input w-full px-4 py-2.5 text-xs font-medium"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Email Address</span>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    required
                    disabled
                    className="qp-input w-full px-4 py-2.5 text-xs font-medium disabled:opacity-50"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile || !name.trim()}
                  className="qp-button px-6 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
