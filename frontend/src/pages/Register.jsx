import React from 'react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const sanitizeValue = (value) => value.trim();

  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.password.length >= 6) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return score;
  }, [form.password]);

  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Excellent'][passwordScore];
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-green-500'][passwordScore];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: sanitizeValue(form.name).replace(/\s+/g, ' '),
        email: sanitizeValue(form.email).toLowerCase(),
        password: sanitizeValue(form.password)
      });

      const { token, user } = response.data.data;
      login(token, user);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      const apiErrors = error.response?.data?.errors || ['Registration failed'];
      const message = apiErrors[0] || 'Registration failed';
      if (message.toLowerCase().includes('email')) {
        setErrors({ email: message });
      } else if (message.toLowerCase().includes('password')) {
        setErrors({ password: message });
      } else if (message.toLowerCase().includes('name')) {
        setErrors({ name: message });
      } else {
        setErrors({ form: message });
      }
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter h-screen overflow-hidden bg-slate-50">
      <div className="grid h-full min-h-0 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden h-full overflow-hidden bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <div className="mb-10 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black">TaskFlow</p>
                <p className="text-sm text-white/75">Role-based productivity, beautifully delivered.</p>
              </div>
            </div>
            <h1 className="max-w-md text-5xl font-black leading-tight">Create your account and start managing work with confidence.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
              Secure authentication, elegant workflows, and a dashboard that feels at home on any screen.
            </p>
          </div>

          <svg viewBox="0 0 560 420" className="relative mt-8 w-full max-w-xl drop-shadow-2xl" role="img" aria-label="Dashboard illustration">
            <defs>
              <linearGradient id="registerDashBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <rect x="20" y="20" width="520" height="340" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <rect x="55" y="58" width="450" height="38" rx="14" fill="rgba(255,255,255,0.12)" />
            <rect x="55" y="120" width="190" height="210" rx="22" fill="url(#registerDashBg)" opacity="0.95" />
            <rect x="270" y="120" width="235" height="98" rx="22" fill="rgba(255,255,255,0.1)" />
            <rect x="270" y="232" width="110" height="98" rx="22" fill="rgba(255,255,255,0.1)" />
            <rect x="395" y="232" width="110" height="98" rx="22" fill="rgba(255,255,255,0.1)" />
            <rect x="92" y="245" width="124" height="14" rx="7" fill="rgba(255,255,255,0.5)" />
            <rect x="92" y="270" width="98" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
            <rect x="92" y="290" width="112" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
            <rect x="294" y="150" width="168" height="14" rx="7" fill="rgba(255,255,255,0.55)" />
            <rect x="294" y="175" width="140" height="10" rx="5" fill="rgba(255,255,255,0.28)" />
            <rect x="294" y="264" width="72" height="10" rx="5" fill="rgba(255,255,255,0.48)" />
            <rect x="294" y="286" width="58" height="10" rx="5" fill="rgba(255,255,255,0.28)" />
            <rect x="420" y="264" width="58" height="10" rx="5" fill="rgba(255,255,255,0.48)" />
            <rect x="420" y="286" width="46" height="10" rx="5" fill="rgba(255,255,255,0.28)" />
          </svg>
        </aside>

        <section className="flex min-h-0 items-stretch justify-center bg-white px-4 py-8 sm:px-6 lg:px-10">
          <div className="flex h-full w-full max-w-md flex-col justify-center overflow-y-auto py-2 animate-fade-in lg:max-h-screen lg:py-8">
            <div className="mb-8 lg:hidden">
              <p className="text-3xl font-black text-gray-900">TaskFlow</p>
              <p className="mt-1 text-sm text-gray-500">Manage your tasks smarter, faster, together.</p>
            </div>

            <div className="rounded-[0.5rem] border border-gray-100 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-700">Create account</p>
                <h2 className="mt-2 text-3xl font-black text-gray-900">Get started free</h2>
              </div>

              {errors.form && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <XCircleIcon className="mt-0.5 h-5 w-5 flex-none" />
                  <span>{errors.form}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Full Name</span>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <XCircleIcon className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Email</span>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <XCircleIcon className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Password</span>
                  <div className="relative">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${Math.max(5, (passwordScore / 4) * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Strength: {strengthText}</p>
                  {errors.password && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <XCircleIcon className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Confirm Password</span>
                  <div className="relative">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <XCircleIcon className="h-4 w-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </label>

                {errors.form && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <XCircleIcon className="mt-0.5 h-5 w-5 flex-none" />
                    <span>{errors.form}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-4 py-3 font-semibold text-white shadow-lg shadow-slate-950/20 transition duration-200 hover:scale-[1.01] hover:from-slate-900 hover:via-gray-850 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                  )}
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-slate-700 hover:text-slate-900 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;
