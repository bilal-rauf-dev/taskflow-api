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
      <div className="relative mb-8 overflow-hidden rounded-lg border-2 border-foreground bg-tertiary p-6 shadow-[6px_6px_0_#1E293B]">
        <span className="shape shape-circle -right-5 -top-8 h-24 w-24 bg-secondary" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Time Management</span>
        <h1 className="qp-heading mt-1 text-4xl text-foreground">Your time, mapped out.</h1>
      </div>

      <div className="qp-card flex flex-1 flex-col overflow-hidden p-5 shadow-[7px_7px_0_#F3E8FF]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
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
                  high: 'bg-red-500 text-white border-red-600',
                  medium: 'bg-amber-500 text-white border-amber-600',
                  low: 'bg-emerald-600 text-white border-emerald-700'
                }[priority] || 'bg-foreground text-white border-foreground';
                
                return {
                  className: `${colors} rounded-sm border-2 border-foreground px-2 text-xs font-bold shadow-xs`
                };
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
