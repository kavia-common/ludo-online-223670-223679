import { getEnv } from "../config/env";

/**
 * Lightweight REST client around fetch with base URL and JSON helpers.
 * Handles common headers and error normalization.
 */
class ApiClient {
  constructor() {
    const { apiBase } = getEnv();
    this.baseUrl = apiBase?.replace(/\/+$/, "") || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  _url(path) {
    const clean = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${clean}`;
  }

  async _request(path, options = {}) {
    const url = this._url(path);
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...(options.headers || {}),
        },
      });
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json().catch(() => null) : await res.text();

      if (!res.ok) {
        const err = new Error(
          (data && (data.message || data.error)) ||
            `Request failed with status ${res.status}`
        );
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch (error) {
      if (!(error instanceof Error)) {
        const e = new Error("Network error");
        e.cause = error;
        throw e;
      }
      throw error;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * get - performs a GET request
   * @param {string} path - API path e.g. "/rooms"
   * @returns {Promise<any>} parsed response
   */
  get(path) {
    return this._request(path, { method: "GET" });
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * post - performs a POST request with optional JSON body
   * @param {string} path
   * @param {object} body
   * @returns {Promise<any>}
   */
  post(path, body) {
    return this._request(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * put - performs a PUT request with optional JSON body
   */
  put(path, body) {
    return this._request(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * del - performs a DELETE request
   */
  del(path) {
    return this._request(path, { method: "DELETE" });
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * getRooms - list available rooms
   */
  async getRooms() {
    return this.get("/rooms");
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * createRoom - create a room
   * @param {{name?: string, capacity?: number, private?: boolean, passcode?: string, playerName: string}} payload
   */
  async createRoom(payload) {
    return this.post("/rooms", payload);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * joinRoom - join a room by code
   * @param {string} code
   * @param {{playerName: string, passcode?: string}} payload
   */
  async joinRoom(code, payload) {
    return this.post(`/rooms/${encodeURIComponent(code)}/join`, payload);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * leaveRoom - leave a room by code
   * @param {string} code
   * @param {{playerName: string}} payload
   */
  async leaveRoom(code, payload) {
    return this.post(`/rooms/${encodeURIComponent(code)}/leave`, payload);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * setReady - set player's ready state in a room
   * @param {string} code
   * @param {{playerName: string, ready: boolean}} payload
   */
  async setReady(code, payload) {
    return this.post(`/rooms/${encodeURIComponent(code)}/ready`, payload);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * startGame - start game in a room
   * @param {string} code
   * @param {{playerName?: string}} payload
   */
  async startGame(code, payload = {}) {
    return this.post(`/rooms/${encodeURIComponent(code)}/start`, payload);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * getState - fetch current game/room state
   * @param {string} code
   */
  async getState(code) {
    return this.get(`/rooms/${encodeURIComponent(code)}/state`);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * roll - perform a dice roll
   * @param {string} code
   * @param {{playerName: string}} payload
   */
  async roll(code, payload) {
    return this.post(`/rooms/${encodeURIComponent(code)}/roll`, payload);
  }

  // PUBLIC_INTERFACE
  /**
   * PUBLIC_INTERFACE
   * move - move a token after a roll
   * @param {string} code
   * @param {{playerName: string, tokenId: string|number}} payload
   */
  async move(code, payload) {
    return this.post(`/rooms/${encodeURIComponent(code)}/move`, payload);
  }
}

const apiClient = new ApiClient();
export default apiClient;
