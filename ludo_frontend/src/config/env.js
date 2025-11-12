//
// PUBLIC_INTERFACE
// Environment configuration for the frontend.
// Reads values from CRA-style REACT_APP_* variables with sensible fallbacks.
//
/**
 * PUBLIC_INTERFACE
 * getEnv - Returns sanitized environment configuration used by the app.
 *
 * This function reads Create React App style environment variables and returns
 * a normalized configuration object with defaults to support local development.
 *
 * Required env keys (set via .env file at project root for CRA):
 * - REACT_APP_API_BASE or REACT_APP_BACKEND_URL: Base URL for REST API
 * - REACT_APP_WS_URL (optional): WebSocket base URL
 *
 * Note: Values are read at build time by CRA and inlined into the bundle.
 */
export function getEnv() {
  const apiBase =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001";

  const wsUrl =
    process.env.REACT_APP_WS_URL ||
    // Attempt to infer ws URL from API base if provided
    (apiBase.startsWith("https://")
      ? apiBase.replace("https://", "wss://")
      : apiBase.startsWith("http://")
      ? apiBase.replace("http://", "ws://")
      : "");

  const siteUrl = process.env.REACT_APP_SITE_URL || "http://localhost:3000";

  return {
    apiBase,
    wsUrl,
    siteUrl,
    nodeEnv: process.env.NODE_ENV || "development",
  };
}

export default getEnv;
