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
      // Avoid leaking sensitive info
      // Provide a normalized error
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
}

const apiClient = new ApiClient();
export default apiClient;
