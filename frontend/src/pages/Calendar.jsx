import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import api from '../api/axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

export default function TaskCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasksForCalendar = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tasks');
        const tasks = res.data.data.tasks || [];
        
        // Map tasks with dueDates into Calendar event objects
        const mappedEvents = tasks
          .filter((t) => t.dueDate)
          .map((t) => {
            const taskDate = new Date(t.dueDate);
            // Treat event as all-day on that date
            return {
              id: t._id,
              title: `[${t.priority.toUpperCase()}] ${t.title}`,
              start: taskDate,
              end: taskDate,
              allDay: true,
              resource: t
            };
          });

        setEvents(mappedEvents);
      } catch (err) {
        console.error('Failed to load calendar events', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksForCalendar();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 h-[calc(100vh-40px)] flex flex-col">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-warm-terracotta">Time Management</span>
        <h1 className="text-2xl font-black text-warm-ink mt-1">Calendar Workspace</h1>
      </div>

      <div className="flex-1 rounded-3xl border border-warm-surface bg-white p-5 shadow-warm-lg overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="flex-1 h-full min-h-[500px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              allDayAccessor="allDay"
              views={['month', 'week', 'day']}
              defaultView="month"
              style={{ height: '100%' }}
              eventPropGetter={(event) => {
                const priority = event.resource?.priority;
                const colors = {
                  high: 'bg-rose-500 text-white border-rose-600',
                  medium: 'bg-amber-500 text-white border-amber-600',
                  low: 'bg-emerald-500 text-white border-emerald-600'
                }[priority] || 'bg-slate-500 text-white border-slate-600';
                
                return {
                  className: `${colors} font-bold text-xs rounded-lg px-2 shadow-sm border`
                };
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
