"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AuthContext from './AuthContext';

interface SocketData {
  type: string;
  // Add other properties that might be in the socket data
  [key: string]: unknown;
}

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  send: (data: Record<string, unknown>) => void;
  socketData: SocketData | undefined;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logoutUser, authTokens } = useContext(AuthContext);
  const socketRef = useRef<WebSocket | null>(null);
  const [socketData, setSocketData] = useState<SocketData>();
  const [isConnected, setIsConnected] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 10;
  const stableConnectionTimer = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!socketData) return;
    // Process any socket data as needed
  }, [socketData]);

  useEffect(() => {
    mounted.current = true;
    let reconnectTimeout: NodeJS.Timeout;

    if (!authTokens || !authTokens.access) {
      setIsConnected(false);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
      return;
    }

    const getReconnectDelay = () => {
      // Exponential backoff: 500ms, 1000ms, 2000ms, 4000ms, etc.
      return Math.min(500 * Math.pow(2, retryCountRef.current), 10000);
    };

    const connectWebSocket = () => {
      console.log('Connecting to Admin WebSocket', retryCountRef.current);

      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }

      const API_HOST = process.env.NEXT_PUBLIC_API_HOST || '';
      const wsProtocol = API_HOST.startsWith('https') ? 'wss' : 'ws';
      const wsBase = API_HOST.replace(/^https?:\/\//, '');
      const ws = new WebSocket(`${wsProtocol}://${wsBase}/ws/dash/${authTokens.access}/`);

      ws.onopen = () => {
        console.log('Connected to Admin WebSocket');
        setIsConnected(true);

        // Reset retry counter after 30 seconds of stable connection
        stableConnectionTimer.current = setTimeout(() => {
          retryCountRef.current = 0;
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (mounted.current) {
            setSocketData(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (stableConnectionTimer.current) {
          clearTimeout(stableConnectionTimer.current);
        }

        retryCountRef.current += 1;
        console.log(`WebSocket closed, attempt ${retryCountRef.current} of ${maxRetries}`);

        if (retryCountRef.current >= maxRetries) {
          console.log('Max retries reached, logging out');
          logoutUser();
          return;
        }

        const delay = getReconnectDelay();
        console.log(`Reconnecting in ${delay}ms...`);
        reconnectTimeout = setTimeout(connectWebSocket, delay);
      };

      ws.onerror = (err) => {
        console.log('WebSocket encountered error:', err);
      };

      socketRef.current = ws;
    };

    connectWebSocket();

    return () => {
      mounted.current = false;
      if (stableConnectionTimer.current) {
        clearTimeout(stableConnectionTimer.current);
      }
      if (socketRef.current) {
        socketRef.current.onclose = null; // Prevent reconnect on component unmount
        socketRef.current.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [authTokens, logoutUser]);

  const send = (data: Record<string, unknown>) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.log('WebSocket is not open. Ready state is:', socketRef.current?.readyState);
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current, isConnected, send, socketData }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};