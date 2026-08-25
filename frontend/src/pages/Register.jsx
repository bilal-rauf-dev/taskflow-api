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
      login(token, user, true);
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
    <div className="page-enter min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative hidden overflow-hidden border-r border-border bg-accent-muted p-10 text-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(43,78,255,0.12) 0.8px, transparent 0.8px)', backgroundSize: '20px 20px' }} />
          <div className="absolute -right-20 top-16 h-72 w-72 rounded-full border border-accent/15 bg-surface/50" />
          <div className="relative">
            <div className="mb-10 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-md bg-accent text-white shadow-sm">
                <UserIcon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-heading text-3xl">TaskFlow</p>
                <p className="text-sm text-foreground-muted">Role-based productivity, beautifully delivered.</p>
              </div>
            </div>
            <h1 className="qp-heading max-w-md text-5xl leading-tight">Create your account and start managing work with confidence.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-foreground-muted">
              Secure authentication, elegant workflows, and a dashboard that feels at home on any screen.
            </p>
          </div>

          <svg viewBox="0 0 560 420" className="relative mt-8 w-full max-w-xl" role="img" aria-label="Dashboard illustration">
            <defs>
              <linearGradient id="registerDashBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2B4EFF" />
                <stop offset="100%" stopColor="#6476FF" />
              </linearGradient>
            </defs>
            <rect x="20" y="20" width="520" height="340" rx="20" fill="#FFFFFF" stroke="#D8D7D2" />
            <rect x="55" y="58" width="450" height="38" rx="8" fill="#EEF1FF" />
            <rect x="55" y="120" width="190" height="210" rx="22" fill="url(#registerDashBg)" opacity="0.95" />
            <rect x="270" y="120" width="235" height="98" rx="12" fill="#FAFAF8" stroke="#E7E6E2" />
            <rect x="270" y="232" width="110" height="98" rx="12" fill="#FAFAF8" stroke="#E7E6E2" />
            <rect x="395" y="232" width="110" height="98" rx="12" fill="#FAFAF8" stroke="#E7E6E2" />
            <rect x="92" y="245" width="124" height="14" rx="7" fill="#D8D7D2" />
            <rect x="92" y="270" width="98" height="10" rx="5" fill="#E7E6E2" />
            <rect x="92" y="290" width="112" height="10" rx="5" fill="#E7E6E2" />
            <rect x="294" y="150" width="168" height="14" rx="7" fill="#5B6270" />
            <rect x="294" y="175" width="140" height="10" rx="5" fill="#D8D7D2" />
            <rect x="294" y="264" width="72" height="10" rx="5" fill="#5B6270" />
            <rect x="294" y="286" width="58" height="10" rx="5" fill="#D8D7D2" />
            <rect x="420" y="264" width="58" height="10" rx="5" fill="#5B6270" />
            <rect x="420" y="286" width="46" height="10" rx="5" fill="#D8D7D2" />
          </svg>
        </aside>

        <section className="flex items-center justify-center bg-background px-4 py-10 sm:px-6 lg:px-10">
          <div className="flex w-full max-w-md flex-col justify-center py-2 animate-fade-in lg:py-8">
            <div className="mb-8 lg:hidden">
              <p className="font-heading text-3xl text-foreground">TaskFlow</p>
              <p className="mt-1 text-sm text-foreground-muted">Manage your tasks smarter, faster, together.</p>
            </div>

            <div className="qp-card p-6 shadow-md sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Create account</p>
                <h2 className="qp-heading mt-2 text-4xl text-foreground">Get started free</h2>
              </div>

              {errors.form && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <XCircleIcon className="mt-0.5 h-5 w-5 flex-none" />
                  <span>{errors.form}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground-muted">Full Name</span>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" strokeWidth={1.5} />
                    <input
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="qp-input w-full py-3 pl-11 pr-4 text-sm"
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
                  <span className="mb-2 block text-sm font-medium text-foreground-muted">Email</span>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" strokeWidth={1.5} />
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="qp-input w-full py-3 pl-11 pr-4 text-sm"
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
                  <span className="mb-2 block text-sm font-medium text-foreground-muted">Password</span>
                  <div className="relative">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" strokeWidth={1.5} />
                    <input
                      name="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="qp-input w-full py-3 pl-11 pr-4 text-sm"
                    />
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                    <div className={`h-full transition-all ${strengthColor}`} style={{ width: `${Math.max(5, (passwordScore / 4) * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-foreground-muted">Strength: {strengthText}</p>
                  {errors.password && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
                      <XCircleIcon className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground-muted">Confirm Password</span>
                  <div className="relative">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" strokeWidth={1.5} />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="qp-input w-full py-3 pl-11 pr-4 text-sm"
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
                  className="qp-button w-full gap-2 px-4 py-3 disabled:cursor-not-allowed disabled:opacity-70"
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

              <p className="mt-6 text-center text-sm text-foreground-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-accent hover:underline">
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
