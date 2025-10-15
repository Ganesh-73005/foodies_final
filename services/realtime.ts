import * as SecureStore from 'expo-secure-store';

const WS_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/^http/, 'ws');

export type RealtimeEvent =
  | { type: 'new_post'; post_id: string; post_type: string };

export type RealtimeListener = (event: RealtimeEvent) => void;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private listeners: Set<RealtimeListener> = new Set();
  private reconnectTimer: any = null;
  private isConnecting = false;

  async connect() {
    if (this.isConnecting || this.socket) return;
    this.isConnecting = true;

    const token = await SecureStore.getItemAsync('authToken');
    const url = `${WS_URL}/ws/feed?token=${encodeURIComponent(token || '')}`;

    try {
      const ws = new WebSocket(url);
      this.socket = ws;

      ws.onopen = () => {
        this.isConnecting = false;
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data) as RealtimeEvent;
          this.listeners.forEach((l) => l(data));
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        this.socket = null;
        this.scheduleReconnect();
      };

      ws.onerror = () => {
        // Will trigger onclose as well
      };
    } catch {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2000);
  }

  subscribe(listener: RealtimeListener) {
    this.listeners.add(listener);
    // Lazy connect
    this.connect();
    return () => this.listeners.delete(listener);
  }
}

export const realtimeClient = new RealtimeClient();
