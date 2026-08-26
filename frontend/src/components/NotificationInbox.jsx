import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

const describeNotification = (notification) => {
  const taskTitle = notification.task?.title || 'a task';

  if (notification.type === 'deadline_warning') {
    return `Deadline approaching for “${taskTitle}”.`;
  }

  if (notification.type === 'task_assigned') {
    return `You were assigned to “${taskTitle}”.`;
  }

  if (notification.type === 'status_changed') {
    return `The status of “${taskTitle}” changed.`;
  }

  return `${notification.sender?.name || 'Someone'} commented on “${taskTitle}”.`;
};

function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (!socket) return undefined;

    const handleNewNotification = (notification) => {
      setNotifications((previous) => [
        notification,
        ...previous.filter((item) => item._id !== notification._id)
      ]);
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch {
      // Keep the notification unread so the user can retry.
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((previous) => previous.map((notification) => ({ ...notification, read: true })));
    } catch {
      // Keep the existing state when the request fails.
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative rounded-full border-2 border-transparent p-2 text-foreground-muted transition hover:border-foreground hover:bg-accent-muted hover:text-accent"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="h-5 w-5" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={setIsOpen} className="relative z-[60]">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-200 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-foreground/45 backdrop-blur-[2px]" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="transition duration-300 ease-out"
              enterFrom="opacity-0 translate-y-3"
              enterTo="opacity-100 translate-y-0"
              leave="transition duration-150 ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-lg border-2 border-foreground bg-surface p-6 shadow-[8px_8px_0_#F472B6]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Inbox</p>
                    <Dialog.Title className="qp-heading mt-1 text-3xl text-foreground">Notifications</Dialog.Title>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border-2 border-transparent p-2 text-foreground-muted transition hover:border-foreground hover:bg-tertiary hover:text-foreground"
                    aria-label="Close notifications"
                  >
                    <XMarkIcon className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-foreground-muted">
                    {unreadCount ? `${unreadCount} unread` : 'You are all caught up'}
                  </span>
                  {unreadCount > 0 && (
                    <button type="button" onClick={markAllAsRead} className="qp-button-ghost min-h-0 px-0 text-sm">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-4 max-h-[24rem] space-y-2 overflow-y-auto">
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-md bg-background" />)}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="rounded-md border-2 border-dashed border-border-strong bg-background px-4 py-10 text-center text-sm text-foreground-muted">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <article
                        key={notification._id}
                        className={`rounded-md border-2 p-4 transition ${
                          notification.read ? 'border-border-strong bg-surface' : 'border-accent bg-accent-muted/45'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-0.5 h-2.5 w-2.5 flex-none rounded-full ${notification.read ? 'bg-border-strong' : 'bg-accent'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-5 text-foreground">{describeNotification(notification)}</p>
                            <p className="mt-1 text-xs text-foreground-muted">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification._id)}
                              className="rounded-sm p-1.5 text-accent transition hover:bg-surface"
                              aria-label="Mark notification as read"
                            >
                              <CheckIcon className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default NotificationInbox;
