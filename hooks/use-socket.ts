import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken, hasAuthSession } from '@/lib/auth';
import { getSocketBaseUrl } from '../lib/socketBaseUrl';
import { MOCK_MODE } from '../lib/mock-api';

/**
 * Hook para gerenciar conexão Socket.IO com autenticação JWT
 * Reutiliza a mesma conexão durante a sessão
 * @param shouldConnect - Se false, não conecta ao socket. Se true ou undefined, conecta normalmente.
 */
export function useSocket(shouldConnect: boolean = true) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (MOCK_MODE) {
      setSocket(null);
      return;
    }
    if (shouldConnect === false) {
      setSocket(null);
      return;
    }

    if (!hasAuthSession()) {
      console.warn('Socket.IO: No auth session, skipping connection');
      return;
    }

    const SOCKET_BASE_URL = getSocketBaseUrl();
    if (!SOCKET_BASE_URL) {
      console.warn('Socket.IO: No socket base URL configured, skipping connection');
      return;
    }

    const instance = getOrCreateSocket(SOCKET_BASE_URL, getToken());
    retainSocket();
    setSocket(instance);

    const onConnect = () => {
      // connection established
    };
    const onDisconnect = (_reason: string) => {
      // connection lost
    };
    const onConnectError = (error: Error) => {
      console.warn('Socket.IO connection error:', error.message);
    };

    instance.on('connect', onConnect);
    instance.on('disconnect', onDisconnect);
    instance.on('connect_error', onConnectError);

    return () => {
      instance.off('connect', onConnect);
      instance.off('disconnect', onDisconnect);
      instance.off('connect_error', onConnectError);
      releaseSocket();
      setSocket(null);
    };
  }, [shouldConnect]);

  return socket;
}

let socketSingleton: Socket | null = null;
let socketUsers = 0;
let socketToken: string | null = null;
let socketBaseUrl: string | null = null;

function getOrCreateSocket(baseUrl: string, token: string | null): Socket {
  const authKey = token ?? '__cookie__';
  const shouldRecreate =
    !socketSingleton ||
    socketToken !== authKey ||
    socketBaseUrl !== baseUrl;

  if (shouldRecreate) {
    try {
      socketSingleton?.disconnect();
    } catch {
      // ignore
    }
    socketSingleton = null;
    socketToken = authKey;
    socketBaseUrl = baseUrl;
  }

  if (!socketSingleton) {
    socketSingleton = io(baseUrl, {
      ...(token
        ? {
            auth: { token, authToken: token, auth_token: token },
            query: { token, authToken: token, auth_token: token },
          }
        : {}),
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  } else if (!socketSingleton.connected) {
    socketSingleton.connect();
  }

  return socketSingleton;
}

function retainSocket() {
  socketUsers += 1;
}

function releaseSocket() {
  socketUsers = Math.max(0, socketUsers - 1);
  if (socketUsers === 0 && socketSingleton) {
    try {
      socketSingleton.disconnect();
    } finally {
      socketSingleton = null;
      socketToken = null;
      socketBaseUrl = null;
    }
  }
}

export function resetSocket() {
  if (socketSingleton) {
    try {
      socketSingleton.disconnect();
    } catch {
      /* ignore */
    }
    socketSingleton = null;
    socketToken = null;
    socketBaseUrl = null;
    socketUsers = 0;
  }
}
