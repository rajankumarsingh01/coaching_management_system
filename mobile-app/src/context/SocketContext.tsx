// src/context/SocketContext.tsx
//
// App-wide Socket.IO connection. Backend attaches Socket.IO directly to the
// raw http server (see src/socket/socket.js on the backend) — NOT under the
// /api/v1 prefix that axiosInstance uses — so we derive the socket URL by
// stripping the /api/... suffix off EXPO_PUBLIC_API_BASE_URL.
//
// Auth works the same way as REST: same JWT access token, sent in the
// handshake as `auth: { token }`. Backend's socket.js already verifies it.

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

const getSocketBaseUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
  // strips a trailing /api or /api/v1 (or any /api/... path) off the REST base URL
  return apiUrl.replace(/\/api(\/.*)?$/, '');
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // logged out — make sure any previous connection is torn down
    if (!accessToken || !user) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = io(getSocketBaseUrl(), {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('connect_error', (err) => {
      console.warn('Socket connect_error:', err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
    // re-connect if the logged-in user changes (e.g. logout -> different login)
  }, [accessToken, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);