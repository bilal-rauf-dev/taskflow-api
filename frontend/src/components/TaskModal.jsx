import React from 'react';
import { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CalendarDaysIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const statusOptions = [
  { label: 'Pending', value: 'pending', active: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  { label: 'In Progress', value: 'in-progress', active: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  { label: 'Completed', value: 'completed', active: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' }
];

const priorityOptions = [
  { label: 'Low', value: 'low', active: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  { label: 'Medium', value: 'medium', active: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { label: 'High', value: 'high', active: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' }
];

const defaultForm = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: ''
};

function TaskModal({ isOpen, onClose, onSubmit, initialTask }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    setActiveTab('details');
    if (initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'pending',
        priority: initialTask.priority || 'medium',
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialTask, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={Dialog} onClose={onClose} className="relative z-50">
      <Transition.Child
        as="div"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <div className="fixed inset-0 flex justify-end">
        <Transition.Child
          as={Dialog.Panel}
          enter="transform transition duration-300 ease-out"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition duration-200 ease-in"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
          className="flex h-full w-full max-w-full flex-col bg-white shadow-2xl sm:max-w-xl"
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-5 py-4 text-white sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Task Editor</p>
              <Dialog.Title className="mt-1 text-xl font-bold">{initialTask ? 'Edit Task' : 'New Task'}</Dialog.Title>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 transition hover:bg-white/20">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {initialTask && (
            <div className="flex border-b border-gray-150 bg-slate-50 px-5 sm:px-6">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 pb-3 pt-3 text-center text-xs font-bold transition border-b-2 ${
                  activeTab === 'details'
                    ? 'border-slate-950 text-slate-950 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`flex-1 pb-3 pt-3 text-center text-xs font-bold transition border-b-2 ${
                  activeTab === 'comments'
                    ? 'border-slate-950 text-slate-950 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Comments
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 pb-3 pt-3 text-center text-xs font-bold transition border-b-2 ${
                  activeTab === 'history'
                    ? 'border-slate-950 text-slate-950 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                History
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {activeTab === 'details' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Title</span>
                  <div className="relative">
                    <PencilSquareIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="title"
                      required
                      value={form.title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Description</span>
                  <textarea
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-sm font-medium text-gray-700">Priority</span>
                  <div className="grid grid-cols-3 gap-3">
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, priority: option.value }))}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          form.priority === option.value
                            ? `${option.active} shadow-sm`
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-sm font-medium text-gray-700">Status</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, status: option.value }))}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          form.status === option.value
                            ? `${option.active} shadow-sm`
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-700">Due Date</span>
                  <div className="relative">
                    <CalendarDaysIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </label>
              </form>
            ) : activeTab === 'comments' ? (
              <CommentsSection taskId={initialTask._id} />
            ) : (
              <HistorySection taskId={initialTask._id} />
            )}
          </div>

          <div className="border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {activeTab === 'details' ? 'Cancel' : 'Close'}
              </button>
              {activeTab === 'details' && (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-gray-850 to-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  {loading ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
}

function CommentsSection({ taskId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/comments`);
      setComments(res.data.data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();

    if (!socket) return;

    socket.emit('join_task_room', taskId);

    socket.on('comment_received', (comment) => {
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [...prev, comment];
      });
    });

    return () => {
      socket.emit('leave_task_room', taskId);
      socket.off('comment_received');
    };
  }, [taskId, socket]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { content: newComment });
      const addedComment = res.data.data.comment;
      setComments((prev) => [...prev, addedComment]);
      setNewComment('');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex-1 overflow-y-auto space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 max-h-[300px]">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No discussion comments yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="text-sm p-3 bg-white rounded-xl shadow-sm border border-slate-150">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-indigo-600">{comment.author?.name}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-700 text-xs font-medium">{comment.content}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs font-medium outline-none focus:border-indigo-500 focus:bg-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
}

function HistorySection({ taskId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}/activity`);
        setLogs(res.data.data.activity || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [taskId]);

  const formatDetail = (log) => {
    const { action, details } = log;
    if (action === 'task_created') return `created the task "${details?.newValue}"`;
    if (action === 'comment_added') return `added a comment: "${details?.newValue}"`;

    const friendlyField = {
      status_changed: 'status',
      priority_changed: 'priority',
      dueDate_changed: 'due date'
    }[action] || 'task';

    const oldVal = details?.oldValue ? details.oldValue : 'none';
    const newVal = details?.newValue ? details.newValue : 'none';

    return `changed ${friendlyField} from "${oldVal}" to "${newVal}"`;
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[350px] p-4 bg-slate-50 rounded-2xl border border-slate-100">
      {logs.length === 0 ? (
        <p className="text-center text-xs text-slate-400 py-6">No actions logged yet.</p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {logs.map((log, logIdx) => (
              <li key={log._id}>
                <div className="relative pb-8">
                  {logIdx !== logs.length - 1 ? (
                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 ring-8 ring-slate-50 text-indigo-600 font-bold text-xs">
                      {log.user?.name ? log.user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-xs text-slate-700">
                          <span className="font-bold text-slate-900">{log.user?.name}</span>{' '}
                          {formatDetail(log)}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TaskModal;
