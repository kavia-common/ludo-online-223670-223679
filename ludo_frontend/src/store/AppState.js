import React, { createContext, useContext, useMemo, useReducer } from "react";

/**
 * State shape
 * - view: 'lobby' | 'room' | 'board'
 * - playerName: string
 * - room: { code: string, players: Array<{name: string, ready: boolean}> } | null
 * - board: minimal board state to render placeholder ludo board
 */

const initialState = {
  view: "lobby",
  playerName: "",
  room: null,
  board: {
    currentTurn: null,
    diceValue: null,
    players: [], // [{name, color}]
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
    case "CREATE_ROOM":
      return {
        ...state,
        room: { code: action.code, players: [{ name: state.playerName, ready: false }] },
        view: "room",
      };
    case "JOIN_ROOM":
      return {
        ...state,
        room: {
          code: action.code,
          players: [...(action.players || []), { name: state.playerName, ready: false }],
        },
        view: "room",
      };
    case "UPDATE_ROOM":
      return { ...state, room: { ...(state.room || {}), ...(action.room || {}) } };
    case "LEAVE_ROOM":
      return { ...state, room: null, view: "lobby" };
    case "START_GAME":
      return {
        ...state,
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
