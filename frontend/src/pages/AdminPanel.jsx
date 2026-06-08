import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function AdminPanel() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/admin/all');
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch admin tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const uniqueUsers = useMemo(() => {
    const userIds = new Set(tasks.map((task) => task.owner?._id).filter(Boolean));
    return userIds.size;
  }, [tasks]);

  const completedRate = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((task) => task.status === 'completed').length / tasks.length) * 100);
  }, [tasks]);

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const ownerInitials = (name) =>
    name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const priorityDot = {
    low: 'bg-green-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500'
  };

  const statusBadge = {
    pending: 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-slate-100 text-slate-700',
    completed: 'bg-green-100 text-green-700'
  };

  return (
    <div className="dashboard-shell min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <section className="overflow-hidden rounded-[0.5rem] bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 p-6 text-white shadow-2xl shadow-slate-950/15 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Admin Panel</h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">Manage all tasks across users.</p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
            <p className="mt-2 text-3xl font-black text-gray-900">{tasks.length}</p>
          </article>
          <article className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <UsersIcon className="h-4 w-4" /> Total Users
            </div>
            <p className="mt-2 text-3xl font-black text-slate-700">{uniqueUsers}</p>
          </article>
          <article className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-medium text-gray-500">Completed Rate</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{completedRate}%</p>
          </article>
        </section>

        <section className="mt-6 overflow-hidden rounded-[0.5rem] border border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-[1024px] w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Owner</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse border-t border-slate-100 odd:bg-white even:bg-slate-50">
                      <td className="px-5 py-4"><div className="h-4 w-48 rounded-full bg-slate-200" /></td>
                      <td className="px-5 py-4"><div className="h-8 w-40 rounded-full bg-slate-200" /></td>
                      <td className="px-5 py-4"><div className="h-6 w-24 rounded-full bg-slate-200" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 rounded-full bg-slate-200" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 rounded-full bg-slate-200" /></td>
                      <td className="px-5 py-4 text-right"><div className="ml-auto h-9 w-9 rounded-full bg-slate-200" /></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-gray-500">No tasks available yet.</td>
                  </tr>
                ) : (
                  tasks.map((task, index) => (
                    <tr key={task._id} className={`border-t border-slate-100 transition hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="px-5 py-4 font-semibold text-gray-900">{task.title}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 text-xs font-bold text-white">
                            {ownerInitials(task.owner?.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{task.owner?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{task.owner?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[task.status]}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-gray-700 capitalize">
                          <span className={`h-2.5 w-2.5 rounded-full ${priorityDot[task.priority]}`} />
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => deleteTask(task._id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"
                          aria-label="Delete task"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 text-center sm:text-left">
          <Link to="/dashboard" className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;