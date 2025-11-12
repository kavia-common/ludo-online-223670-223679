import React, { createContext, useContext, useMemo, useReducer } from "react";

/**
 * State shape
 * - view: 'lobby' | 'room' | 'board'
 * - playerName: string
 * - room: { code: string, players: Array<{name: string, ready: boolean}> } | null
 * - board: minimal board state to render placeholder ludo board
 * - loading: boolean
 * - error: string|null
 * - currentPlayerId: string|null
 */

const initialState = {
  view: "lobby",
  playerName: "",
  currentPlayerId: null,
  room: null,
  loading: false,
  error: null,
  board: {
    currentTurn: null,
    diceValue: null,
    players: [], // [{name, color}]
    lastEvent: null,
  },
};

const AppStateContext = createContext(undefined);
const AppDispatchContext = createContext(undefined);

function reducer(state, action) {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.view };
    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.name };
    case "SET_LOADING":
      return { ...state, loading: !!action.value };
    case "SET_ERROR":
      return { ...state, error: action.error || null };
    case "CREATE_ROOM_SUCCESS":
      return {
        ...state,
        error: null,
        room: { code: action.room.code, players: action.room.players || [] },
        view: "room",
      };
    case "JOIN_ROOM_SUCCESS":
      return {
        ...state,
        error: null,
        room: { code: action.room.code, players: action.room.players || [] },
        view: "room",
      };
    case "UPDATE_ROOM":
      return { ...state, room: { ...(state.room || {}), ...(action.room || {}) } };
    case "LEAVE_ROOM_SUCCESS":
    case "LEAVE_ROOM":
      return { ...state, room: null, view: "lobby" };
    case "START_GAME_SUCCESS":
    case "START_GAME":
      return {
        ...state,
        error: null,
        view: "board",
        board: {
          ...state.board,
          currentTurn: action.currentTurn || state.playerName,
          diceValue: null,
          players: action.players || [],
        },
      };
    case "SET_DICE":
      return {
        ...state,
        board: {
          ...state.board,
          diceValue: action.value,
        },
      };
    case "NEXT_TURN":
      return {
        ...state,
        board: {
          ...state.board,
          currentTurn: action.playerName,
        },
      };
    // Server-sent events via WebSocket
    case "WS_PLAYER_JOINED":
      return {
        ...state,
        room: {
          ...(state.room || {}),
          players: Array.from(
            new Map(
            ([...(state.room?.players || []), action.player].map(p => [p.name, p]))
            ).values()
          ),
        },
      };
    case "WS_READY_CHANGED":
      return {
        ...state,
        room: {
          ...(state.room || {}),
          players: (state.room?.players || []).map(p =>
            p.name === action.player.name ? { ...p, ready: action.player.ready } : p
          ),
        },
      };
    case "WS_GAME_STARTED":
      return {
        ...state,
        view: "board",
        board: {
          ...state.board,
          players: action.players || state.board.players,
          currentTurn: action.currentTurn || state.board.currentTurn,
          diceValue: null,
          lastEvent: "GameStarted",
        },
      };
    case "WS_GAME_STATE_UPDATED":
      return {
        ...state,
        board: {
          ...state.board,
          ...action.state,
          lastEvent: "GameStateUpdated",
        },
      };
    case "WS_DICE_ROLLED":
      return {
        ...state,
        board: {
          ...state.board,
          diceValue: action.value,
          lastEvent: "DiceRolled",
        },
      };
    case "WS_TOKEN_MOVED":
      return {
        ...state,
        board: {
          ...state.board,
          lastEvent: "TokenMoved",
        },
      };
    case "WS_CAPTURE":
      return {
        ...state,
        board: {
          ...state.board,
          lastEvent: "Capture",
        },
      };
    case "WS_WIN":
      return {
        ...state,
        board: {
          ...state.board,
          winner: action.winner,
          lastEvent: "Win",
        },
      };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
/**
 * PUBLIC_INTERFACE
 * AppStateProvider - wraps the app with global state
 */
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const api = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AppStateContext.Provider value={api}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// PUBLIC_INTERFACE
/**
 * PUBLIC_INTERFACE
 * useAppState - returns { state, dispatch }
 */
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
