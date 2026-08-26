import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
            success: {
              style: {
                background: '#ecfdf5',
                color: '#065f46',
                border: '2px solid #1E293B',
                boxShadow: '4px 4px 0 #1E293B'
              },
              iconTheme: {
                primary: '#059669',
                secondary: '#ffffff'
              }
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '2px solid #1E293B',
                boxShadow: '4px 4px 0 #1E293B'
              },
              iconTheme: {
                primary: '#dc2626',
                secondary: '#ffffff'
              }
            },
            style: {
              borderRadius: '16px',
              border: '2px solid #1E293B',
              background: '#8B5CF6',
              color: '#FFFFFF',
              fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
              fontWeight: 600,
              boxShadow: '4px 4px 0 #1E293B'
            }
          }}
        />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
