import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminProductivity() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalCompletions: 0, weeklyAvg: 0 });

  useEffect(() => {
    const fetchProductivity = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/productivity');
        const rawReport = res.data.data.report || [];
        
        const formatted = rawReport.map((item) => ({
          week: `Week ${item._id}`,
          Completions: item.completions
        }));

        setData(formatted);

        const total = rawReport.reduce((sum, item) => sum + item.completions, 0);
        const avg = rawReport.length > 0 ? (total / rawReport.length).toFixed(1) : 0;
        setStats({ totalCompletions: total, weeklyAvg: avg });
      } catch (err) {
        toast.error('Failed to load productivity analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchProductivity();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 p-6 text-white shadow-2xl sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-400">Admin Command Center</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Productivity Velocity</h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              Monitor team performance, task completions, and workflow velocity curves over calendar weeks.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Task Completions</span>
            <p className="mt-2 text-4xl font-black text-indigo-600">{stats.totalCompletions}</p>
          </div>
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Completions / Week</span>
            <p className="mt-2 text-4xl font-black text-emerald-600">{stats.weeklyAvg}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Completed Tasks Timeline</h3>
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              No task completion data recorded yet. Mark tasks as completed to populate charts!
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                  <ReferenceLine y={stats.weeklyAvg} stroke="#059669" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#059669', fontSize: 10, position: 'insideTopLeft' }} />
                  <Bar dataKey="Completions" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
