# Lightweight React Template for KAVIA

Now extended with Ludo UI scaffolding, environment-based API configuration, and Ocean Professional theme.

## Features

- Ocean Professional theme (blue & amber accents, clean modern look)
- Lobby → Room → Board flow wired to backend
- Fetch-based REST client and optional WebSocket client
- Global state via Context + Reducer with server event handling
- CRA-compatible environment variables

## Environment

Copy `.env.example` to `.env` and adjust:
- `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL`: REST API base (defaults to `http://localhost:3001`)
- `REACT_APP_WS_URL`: optional websocket url (`ws://localhost:3001/ws`), otherwise derived from API base
- `REACT_APP_SITE_URL`: public site origin

Note: CRA inlines environment variables at build time.

## REST & WebSocket

- REST methods exposed via `src/services/apiClient.js`:
  - getRooms(), createRoom(payload), joinRoom(code,payload), leaveRoom(code,payload),
    setReady(code,payload), startGame(code,payload), getState(code),
    roll(code,payload), move(code,payload)
- WebSocket client (`src/services/wsClient.js`) connects to `REACT_APP_WS_URL` (default `/ws`) and emits `message` events.
  Expected event types: PlayerJoined, ReadyChanged, GameStarted, GameStateUpdated, DiceRolled, TokenMoved, Capture, Win.
  The Room component subscribes and dispatches to the reducer.

## Structure

- `src/config/env.js` – environment reader
- `src/services/apiClient.js` – fetch-based REST client
- `src/services/wsClient.js` – optional WebSocket client
- `src/store/AppState.js` – global state and reducer cases for server messages
- `src/components/` – Lobby, Room, Board
- `src/theme.css` – theme tokens for Ocean Professional

## Notes

- UI includes basic loading and error states and guards against double submissions.
- If your backend requires STOMP/SockJS, adapt `wsClient` to use those protocols.
