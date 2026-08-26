import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from './context/SocketContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Boards from './pages/Boards';
import BoardView from './pages/BoardView';
import AdminPanel from './pages/AdminPanel';
import AdminProductivity from './pages/AdminProductivity';
import Calendar from './pages/Calendar';
import Timer from './pages/Timer';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';

function App() {
  const location = useLocation();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', (notification) => {
      const senderName = notification.sender?.name || 'Someone';
      const taskTitle = notification.task?.title || 'a task';
      const message = notification.type === 'deadline_warning'
        ? `⏰ Deadline approaching for "${taskTitle}"`
        : `💬 ${senderName} commented on task "${taskTitle}"`;

      toast(message, {
        duration: 5000,
        style: {
          background: '#EEF2FF',
          color: '#3730A3',
          border: '1px solid #C7D2FE',
          borderRadius: '12px'
        }
      });
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  return (
    <div key={location.pathname} className="page-enter min-h-screen">
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Persistent Sidebar layout wrapping all protected workspaces */}
        <Route
          element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/boards" element={<Boards />} />
          <Route path="/boards/:boardId" element={<BoardView />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/productivity"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminProductivity />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
