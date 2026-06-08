import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  PlusIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

const filters = ['all', 'pending', 'in-progress', 'completed'];

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter((task) => task.status === 'in-progress').length;
    const pending = tasks.filter((task) => task.status === 'pending').length;

    return { total, completed, inProgress, pending };
  }, [tasks]);

  const filterCounts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((task) => task.status === 'pending').length,
      'in-progress': tasks.filter((task) => task.status === 'in-progress').length,
      completed: tasks.filter((task) => task.status === 'completed').length
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const byStatus = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
    const query = search.trim().toLowerCase();

    if (!query) return byStatus;

    return byStatus.filter((task) => {
      const titleMatch = task.title?.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query);
      return titleMatch || descriptionMatch;
    });
  }, [tasks, filter, search]);

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSubmitTask = async (payload) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created successfully');
      }
      await fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save task');
      throw error;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete task');
    }
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      Icon: Bars3BottomLeftIcon,
      iconClass: 'from-slate-950 via-gray-850 to-slate-900',
      textClass: 'text-slate-700'
    },
    {
      title: 'Completed',
      value: stats.completed,
      Icon: CheckCircleIcon,
      iconClass: 'from-emerald-500 to-green-600',
      textClass: 'text-emerald-700'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      Icon: ClockIcon,
      iconClass: 'from-amber-500 to-orange-500',
      textClass: 'text-amber-700'
    },
    {
      title: 'Pending',
      value: stats.pending,
      Icon: ExclamationTriangleIcon,
      iconClass: 'from-rose-500 to-red-600',
      textClass: 'text-rose-700'
    }
  ];

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="dashboard-shell min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-6 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <section className="overflow-hidden rounded-[0.5rem] bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 p-6 text-white shadow-2xl shadow-slate-950/15 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Workspace overview</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Welcome back, {user?.name}!</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                {currentDate} · Manage your task flow with clarity, speed, and a premium dashboard experience.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white/90 backdrop-blur">
              {isAdmin ? 'Admin access enabled' : 'User workspace'}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ title, value, Icon, iconClass, textClass }) => (
            <article key={title} className="group rounded-[0.5rem] border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${iconClass} p-3 text-white shadow-lg shadow-slate-900/10 transition group-hover:scale-105`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500">{title}</p>
              <p className={`mt-1 text-3xl font-black ${textClass}`}>{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[0.5rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 transition hover:bg-gray-200"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        <section className="mt-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === item
                  ? 'bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 text-white shadow-lg shadow-slate-950/20'
                  : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{item === 'all' ? 'All' : item.replace('-', ' ')}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${filter === item ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {filterCounts[item]}
              </span>
            </button>
          ))}
        </section>

        <section className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-3xl bg-white/80 p-5 shadow-sm">
                  <div className="mb-4 h-4 w-24 rounded-full bg-gray-200" />
                  <div className="mb-3 h-6 w-3/4 rounded-full bg-gray-200" />
                  <div className="mb-2 h-4 w-full rounded-full bg-gray-100" />
                  <div className="mb-2 h-4 w-5/6 rounded-full bg-gray-100" />
                  <div className="mt-8 h-10 w-full rounded-2xl bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="grid place-items-center rounded-[0.5rem] border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm sm:p-16">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <ClipboardDocumentCheckIcon className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {search ? 'No tasks match your search' : 'No tasks yet. Create your first one!'}
              </h3>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                {search
                  ? 'Try a different keyword or clear the search to view all tasks.'
                  : 'Build momentum by adding a task and letting the dashboard do the rest.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDeleteTask} />
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={openCreate}
          className="animate-pulse-soft sticky bottom-6 left-full z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-950 via-gray-850 to-slate-900 text-white shadow-2xl shadow-slate-950/25 transition hover:scale-105"
          aria-label="Create task"
        >
          <PlusIcon className="h-7 w-7" />
        </button>
      </main>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTask}
        initialTask={editingTask}
      />
    </div>
  );
}

export default Dashboard;