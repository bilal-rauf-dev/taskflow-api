import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0'
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
                border: '1px solid #fecaca'
              },
              iconTheme: {
                primary: '#dc2626',
                secondary: '#ffffff'
              }
            },
            style: {
              borderRadius: '12px',
              background: '#111827',
              color: '#f9fafb'
            }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
