import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

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
    pending: 'bg-background text-foreground-muted',
    'in-progress': 'bg-amber-50 text-warning',
    completed: 'bg-emerald-50 text-success'
  };

  return (
    <div className="dashboard-shell min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin workspace</p>
          <h1 className="qp-heading mt-2 text-4xl tracking-tight text-foreground sm:text-5xl">Admin Panel</h1>
          <p className="mt-2 text-sm text-foreground-muted sm:text-base">Manage all tasks across users.</p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="qp-card p-5 shadow-xs">
            <p className="text-sm font-medium text-foreground-muted">Total Tasks</p>
            <p className="qp-heading mt-2 text-4xl text-foreground">{tasks.length}</p>
          </article>
          <article className="qp-card p-5 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground-muted">
              <UsersIcon className="h-4 w-4 text-accent" strokeWidth={1.5} /> Total Users
            </div>
            <p className="qp-heading mt-2 text-4xl text-foreground">{uniqueUsers}</p>
          </article>
          <article className="qp-card p-5 shadow-xs">
            <p className="text-sm font-medium text-foreground-muted">Completed Rate</p>
            <p className="qp-heading mt-2 text-4xl text-success">{completedRate}%</p>
          </article>
        </section>

        <section className="qp-card mt-6 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1024px] w-full text-left text-sm">
              <thead className="bg-background text-xs font-semibold uppercase tracking-wide text-foreground-muted">
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
                    <tr key={index} className="animate-pulse border-t border-border bg-surface">
                      <td className="px-5 py-4"><div className="h-4 w-48 rounded-full bg-border" /></td>
                      <td className="px-5 py-4"><div className="h-8 w-40 rounded-full bg-border" /></td>
                      <td className="px-5 py-4"><div className="h-6 w-24 rounded-full bg-border" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 rounded-full bg-border" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 rounded-full bg-border" /></td>
                      <td className="px-5 py-4 text-right"><div className="ml-auto h-9 w-9 rounded-full bg-border" /></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-foreground-muted">No tasks available yet.</td>
                  </tr>
                ) : (
                  tasks.map((task, index) => (
                    <tr key={task._id} className={`border-t border-border transition hover:bg-background ${index % 2 === 0 ? 'bg-surface' : 'bg-background/50'}`}>
                      <td className="px-5 py-4 font-semibold text-foreground">{task.title}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-semibold text-white shadow-xs">
                            {ownerInitials(task.owner?.name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{task.owner?.name || 'Unknown'}</p>
                            <p className="text-xs text-foreground-muted">{task.owner?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[task.status]}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-foreground capitalize">
                          <span className={`h-2.5 w-2.5 rounded-full ${priorityDot[task.priority]}`} />
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-foreground-muted">
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
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-danger transition hover:bg-red-50"
                          aria-label="Delete task"
                        >
                          <TrashIcon className="h-5 w-5" strokeWidth={1.5} />
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
          <Link to="/dashboard" className="qp-button-secondary px-4 text-sm">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;
