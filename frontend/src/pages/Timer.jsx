import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const FOCUS_TIME = 1500; // 25 mins
const BREAK_TIME = 300;   // 5 mins

export default function Timer() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks((res.data.data.tasks || []).filter(t => t.status !== 'completed'));
      } catch (err) {
        console.error('Failed to fetch tasks for timer dropdown', err);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const handleComplete = async () => {
    setIsRunning(false);
    
    if (mode === 'focus') {
      toast.success('Focus session complete! Take a break.');
      if (selectedTaskId) {
        try {
          await api.post(`/tasks/${selectedTaskId}/time-log`, { durationSeconds: FOCUS_TIME });
          toast.success('Focus duration saved to task logs');
        } catch (err) {
          toast.error('Failed to log focus duration on server');
        }
      }
      setMode('break');
      setSecondsLeft(BREAK_TIME);
    } else {
      toast.success('Break complete! Ready to focus?');
      setMode('focus');
      setSecondsLeft(FOCUS_TIME);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-warm-surface bg-white p-6 shadow-warm-lg text-center space-y-6 sm:p-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-warm-terracotta">Productivity Booster</span>
          <h1 className="mt-1 text-2xl font-black text-warm-ink">Focus Pomodoro</h1>
        </div>

        {/* Task Selection Dropdown */}
        <div className="text-left space-y-2">
          <label className="text-xs font-bold text-warm-muted uppercase tracking-wider block">Link to active task</label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={isRunning}
            className="w-full rounded-2xl border border-gray-200 bg-warm-canvas py-3 px-4 text-sm outline-none transition focus:border-warm-amber focus:bg-white disabled:opacity-60"
          >
            <option value="">Choose an active task (Optional)</option>
            {tasks.map((task) => (
              <option key={task._id} value={task._id}>
                [{task.priority.toUpperCase()}] {task.title}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Controls for Mode Selection */}
        <div className="flex gap-2 p-1 bg-warm-canvas rounded-2xl border border-warm-surface">
          <button
            type="button"
            onClick={() => switchMode('focus')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'focus' ? 'bg-white text-warm-ink shadow-warm-sm' : 'text-warm-muted hover:text-warm-ink'
            }`}
          >
            Work Session (25m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('break')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'break' ? 'bg-white text-warm-ink shadow-warm-sm' : 'text-warm-muted hover:text-warm-ink'
            }`}
          >
            Short Break (5m)
          </button>
        </div>

        {/* Main Countdown Display */}
        <div className="relative py-8 flex justify-center">
          <div className="text-8xl font-black tracking-tighter text-warm-ink tabular-nums select-none">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={resetTimer}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white text-warm-muted hover:bg-warm-canvas transition shadow-warm-sm"
            aria-label="Reset Timer"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className={`inline-flex h-14 px-8 items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-md transition ${
              isRunning ? 'bg-warm-muted hover:scale-[1.01]' : 'bg-warm-terracotta hover:scale-[1.01]'
            }`}
          >
            {isRunning ? (
              <>
                <PauseIcon className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5" />
                Start Focus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
