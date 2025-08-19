import { io, Socket } from 'socket.io-client';

interface SocketOptions {
  namespace: string;
}

interface ExceptionFormat {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  context?: string;
}

interface ConnectErrorEvent {
  message: string; // JSON 문자열화된 ExceptionFormat
}

class WebSocketManager {
  private sockets: Map<string, Socket> = new Map();
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL;
  }

  connect(options: SocketOptions): Socket {
    const { namespace } = options;
    const socketKey = namespace;

    // 기존 연결이 있고 연결되어 있다면 재사용
    if (this.sockets.has(socketKey)) {
      const existingSocket = this.sockets.get(socketKey)!;
      if (existingSocket.connected) {
        return existingSocket;
      }
      // 연결이 끊어진 상태라면 정리
      existingSocket.removeAllListeners();
      this.sockets.delete(socketKey);
    }

    const socketUrl = `${this.baseURL}/${namespace}`;

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket'],
    });

    this.sockets.set(socketKey, socket);
    return socket;
  }

  getSocket(namespace: string): Socket | null {
    const socketKey = namespace;
    return this.sockets.get(socketKey) || null;
  }

  disconnect(namespace: string): void {
    const socketKey = namespace;
    const socket = this.sockets.get(socketKey);

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      this.sockets.delete(socketKey);
    }
  }
}

// 싱글톤 인스턴스 생성
const webSocketManager = new WebSocketManager();

export default webSocketManager;
export { WebSocketManager };
export type { ConnectErrorEvent, ExceptionFormat, SocketOptions };
