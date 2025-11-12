# Lightweight React Template for KAVIA

Now extended with Ludo UI scaffolding, environment-based API configuration, and Ocean Professional theme.

## Features

- Ocean Professional theme (blue & amber accents, clean modern look)
- Lobby → Room → Board flow scaffold
- Lightweight REST and optional WebSocket clients
- Global state via Context + Reducer
- CRA-compatible environment variables

## Environment

Copy `.env.example` to `.env` and adjust:
- `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL`: REST API base (defaults to `http://localhost:3001`)
- `REACT_APP_WS_URL`: optional websocket url (`ws://localhost:3001/ws`), otherwise derived
- `REACT_APP_SITE_URL`: public site origin

Note: CRA inlines environment variables at build time.

## Scripts

- `npm start` – start dev server
- `npm test` – run tests
- `npm run build` – production build

## Structure

- `src/config/env.js` – environment reader
- `src/services/apiClient.js` – fetch-based REST client
- `src/services/wsClient.js` – optional WebSocket client
- `src/store/AppState.js` – global state
- `src/components/` – Lobby, Room, Board
- `src/theme.css` – theme tokens for Ocean Professional

## Notes

This is an initial scaffold. Integrate real backend endpoints and ws events when available.
