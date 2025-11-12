import { getEnv } from "../config/env";

/**
 * Minimal WebSocket client wrapper with auto reconnect (simple backoff).
 * Designed to be optional: if no wsUrl, it will noop.
 */
class WSClient {
  constructor() {
    const { wsUrl } = getEnv();
    this.baseUrl = wsUrl || "";
    this.socket = null;
    this.listeners = new Map();
    this._reconnectAttempts = 0;
    this._maxReconnect = 5;
    this._closedExplicitly = false;
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * connect - open ws connection to provided path or base URL
   * @param {string} path - optional, appended to baseUrl
   */
  connect(path = "") {
    if (!this.baseUrl) return;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const cleanBase = this.baseUrl.replace(/\/+$/, "");
    const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
    const url = `${cleanBase}${cleanPath}`;

    try {
      this._closedExplicitly = false;
      this.socket = new WebSocket(url);
      this._bind();
    } catch {
      // Swallow to avoid crashing UI; rely on reconnect
    }
  }

  _bind() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this._reconnectAttempts = 0;
      this._emit("open");
    };

    this.socket.onmessage = (event) => {
      let payload = event.data;
      try {
        payload = JSON.parse(event.data);
      } catch {
        // non-json payloads allowed
      }
      this._emit("message", payload);
    };

    this.socket.onerror = (err) => {
      this._emit("error", err);
    };

    this.socket.onclose = () => {
      this._emit("close");
      if (!this._closedExplicitly && this._reconnectAttempts < this._maxReconnect) {
        const delay = Math.min(30000, 1000 * 2 ** this._reconnectAttempts);
        this._reconnectAttempts += 1;
        setTimeout(() => this.connect(), delay);
      }
    };
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * send - send a message through the socket (stringified if object)
   */
  send(data) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    this.socket.send(payload);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * close - closes the connection and stops reconnection attempts
   */
  close() {
    this._closedExplicitly = true;
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // ignore
      }
    }
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * on - add an event listener (open, message, error, close)
   */
  on(event, cb) {
    const list = this.listeners.get(event) || [];
    list.push(cb);
    this.listeners.set(event, list);
    return () => this.off(event, cb);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * off - remove event listener
   */
  off(event, cb) {
    const list = this.listeners.get(event) || [];
    this.listeners.set(
      event,
      list.filter((f) => f !== cb)
    );
  }

  _emit(event, data) {
    const list = this.listeners.get(event) || [];
    list.forEach((cb) => {
      try {
        cb(data);
      } catch {
        // ignore listener errors
      }
    });
  }
}

const wsClient = new WSClient();
export default wsClient;
