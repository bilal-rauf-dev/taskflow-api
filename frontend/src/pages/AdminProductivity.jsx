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
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin Command Center</p>
            <h1 className="qp-heading mt-2 text-4xl tracking-tight text-foreground sm:text-5xl">Productivity Velocity</h1>
            <p className="mt-2 text-sm text-foreground-muted sm:text-base">
              Monitor team performance, task completions, and workflow velocity curves over calendar weeks.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="qp-card qp-card-interactive p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Total Task Completions</span>
            <p className="qp-heading mt-2 text-5xl text-accent">{stats.totalCompletions}</p>
          </div>
          <div className="qp-card qp-card-interactive p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">Average Completions / Week</span>
            <p className="qp-heading mt-2 text-5xl text-success">{stats.weeklyAvg}</p>
          </div>
        </section>

        <section className="qp-card mt-6 p-6 shadow-sm">
          <h3 className="qp-heading mb-6 text-3xl text-foreground">Completed Tasks Timeline</h3>
          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-foreground-muted">
              No task completion data recorded yet. Mark tasks as completed to populate charts!
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E6E2" vertical={false} />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      borderRadius: '8px',
                      color: '#14171F',
                      border: '1px solid #E7E6E2',
                      fontSize: '12px'
                    }}
                  />
                  <ReferenceLine y={stats.weeklyAvg} stroke="#1F9D6E" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#1F9D6E', fontSize: 10, position: 'insideTopLeft' }} />
                  <Bar dataKey="Completions" fill="#2B4EFF" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
