/**
 * useSocket.js
 * Custom React hook that manages the Socket.IO connection to the backend.
 * Returns connection state and subscribes to 'simulation_event'.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { BASE } from '../api/transferApi';

export function useSocket(onEvent) {
  const socketRef  = useRef(null);
  const onEventRef = useRef(onEvent);
  const [connected, setConnected] = useState(false);

  // Keep the callback ref fresh without reconnecting
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    const socket = io(BASE, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('simulation_event', (event) => {
      onEventRef.current?.(event);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Connect once on mount

  const emit = useCallback((ev, data) => {
    socketRef.current?.emit(ev, data);
  }, []);

  return { connected, emit };
}
