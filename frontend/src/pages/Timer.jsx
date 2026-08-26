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
      <div className="qp-card relative space-y-6 overflow-hidden p-6 text-center shadow-[8px_8px_0_#F472B6] sm:p-8">
        <span className="shape shape-square -right-5 -top-5 h-16 w-16 bg-tertiary" aria-hidden="true" />
        <span className="shape shape-circle -bottom-8 -left-8 h-24 w-24 bg-quaternary" aria-hidden="true" />
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Productivity Booster</span>
          <h1 className="qp-heading mt-1 text-4xl text-foreground">Focus Pomodoro</h1>
        </div>

        {/* Task Selection Dropdown */}
        <div className="text-left space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">Link to active task</label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={isRunning}
            className="qp-input w-full px-4 py-3 text-sm disabled:opacity-60"
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
        <div className="flex gap-2 rounded-full border-2 border-foreground bg-background p-1.5">
          <button
            type="button"
            onClick={() => switchMode('focus')}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
              mode === 'focus' ? 'bg-accent text-white shadow-xs' : 'text-foreground-muted hover:bg-tertiary hover:text-foreground'
            }`}
          >
            Work Session (25m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('break')}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition ${
              mode === 'break' ? 'bg-quaternary text-foreground shadow-xs' : 'text-foreground-muted hover:bg-tertiary hover:text-foreground'
            }`}
          >
            Short Break (5m)
          </button>
        </div>

        {/* Main Countdown Display */}
        <div className="relative flex justify-center py-8">
          <div className="select-none rounded-full border-[3px] border-foreground bg-accent-muted px-8 py-10 font-heading text-7xl font-extrabold tracking-tighter text-foreground shadow-[6px_6px_0_#FBBF24] tabular-nums sm:text-8xl">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={resetTimer}
            className="qp-button-secondary h-12 w-12 p-0 text-foreground-muted"
            aria-label="Reset Timer"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggleTimer}
            className={`inline-flex h-14 items-center justify-center gap-2 rounded-full border-2 border-foreground px-8 font-heading font-bold shadow-pop transition ${
              isRunning ? 'bg-secondary text-white hover:-translate-y-1' : 'bg-accent text-white hover:-translate-y-1'
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
