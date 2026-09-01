import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_ORIGIN } from '../api/config';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token, isGuest } = useAuth();

  useEffect(() => {
    // Guest Mode has no backend to connect to (and, on a frontend-only
    // deploy, no backend at all) - never open a socket for it.
    if (!user || !token || isGuest) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to backend server
    const newSocket = io(API_ORIGIN, {
      transports: ['websocket'],
      upgrade: false,
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // The server joins this authenticated socket to its own user/admin rooms.
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, token, isGuest]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
