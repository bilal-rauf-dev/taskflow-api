import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to backend server
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      const userId = user.id || user._id;
      if (userId) {
        newSocket.emit('join_user_room', userId);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
