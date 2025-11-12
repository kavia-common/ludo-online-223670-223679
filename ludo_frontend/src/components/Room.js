import React, { useEffect, useMemo, useState } from "react";
import { useAppState } from "../store/AppState";
import apiClient from "../services/apiClient";
import wsClient from "../services/wsClient";

/**
 * Room: shows players, allows toggling ready and starting game when all ready.
 * Connects to WebSocket topic /topic/game/{roomCode} (backend should broadcast there).
 */
export default function Room() {
  const { state, dispatch } = useAppState();
  const [busy, setBusy] = useState(false);

  const players = state.room?.players || [];
  const you = useMemo(
    () => players.find((p) => p.name === state.playerName),
    [players, state.playerName]
  );

  const allReady = players.length > 1 && players.every((p) => p.ready);

  // Connect WS and subscribe for room updates
  useEffect(() => {
    if (!state.room?.code) return;
    // Connect once to /ws (default path) and filter messages by roomCode if server multiplexes
    wsClient.connect("/ws");
    const offOpen = wsClient.on("open", () => {
      // Could send a subscribe message if backend requires
    });

    const offMsg = wsClient.on("message", (payload) => {
      // Expect server messages with a 'type' field and 'roomCode'
      if (!payload || payload.roomCode !== state.room.code) return;
      switch (payload.type) {
        case "PlayerJoined":
          dispatch({ type: "WS_PLAYER_JOINED", player: payload.player });
          break;
        case "ReadyChanged":
          dispatch({ type: "WS_READY_CHANGED", player: payload.player });
          break;
        case "GameStarted":
          dispatch({
            type: "WS_GAME_STARTED",
            players: payload.players,
            currentTurn: payload.currentTurn,
          });
          break;
        case "GameStateUpdated":
          dispatch({
            type: "WS_GAME_STATE_UPDATED",
            state: payload.state,
          });
          break;
        case "DiceRolled":
          dispatch({ type: "WS_DICE_ROLLED", value: payload.value });
          break;
        case "TokenMoved":
          dispatch({ type: "WS_TOKEN_MOVED", move: payload.move });
          break;
        case "Capture":
          dispatch({ type: "WS_CAPTURE", capture: payload.capture });
          break;
        case "Win":
          dispatch({ type: "WS_WIN", winner: payload.winner });
          break;
        default:
          break;
      }
    });

    const offError = wsClient.on("error", () => {});
    const offClose = wsClient.on("close", () => {});
    // On mount, also fetch current state once
    (async () => {
      try {
        const st = await apiClient.getState(state.room.code);
        if (st?.room) dispatch({ type: "UPDATE_ROOM", room: st.room });
        if (st?.board) {
          dispatch({
            type: "WS_GAME_STATE_UPDATED",
            state: st.board,
          });
        }
      } catch {
        // ignore if unavailable
      }
    })();

    return () => {
      offOpen();
      offMsg();
      offError();
      offClose();
      // keep socket for board; do not close aggressively
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.room?.code]);

  const toggleReady = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Optimistic minimal
      dispatch({
        type: "UPDATE_ROOM",
        room: {
          players: players.map((p) =>
            p.name === state.playerName ? { ...p, ready: !p.ready } : p
          ),
        },
      });
      await apiClient.setReady(state.room.code, {
        playerName: state.playerName,
        ready: !you?.ready,
      });
    } catch (e) {
      // rollback visual by re-fetching state
      try {
        const st = await apiClient.getState(state.room.code);
        if (st?.room) dispatch({ type: "UPDATE_ROOM", room: st.room });
      } catch {}
      dispatch({ type: "SET_ERROR", error: e?.message || "Failed to set ready" });
    } finally {
      setBusy(false);
    }
  };

  const startGame = async () => {
    if (!allReady || busy) return;
    setBusy(true);
    try {
      const res = await apiClient.startGame(state.room.code, { playerName: state.playerName });
      const playersResp = res?.players || players.map((p, i) => ({ name: p.name, color: pickColor(i) }));
      dispatch({
        type: "START_GAME_SUCCESS",
        players: playersResp,
        currentTurn: res?.currentTurn || playersResp?.[0]?.name || state.playerName,
      });
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: e?.message || "Failed to start game" });
    } finally {
      setBusy(false);
    }
  };

  const leaveRoom = async () => {
    if (!state.room?.code || busy) return;
    setBusy(true);
    try {
      await apiClient.leaveRoom(state.room.code, { playerName: state.playerName });
    } catch {
      // ignore
    } finally {
      dispatch({ type: "LEAVE_ROOM_SUCCESS" });
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="badge">Room • {state.room?.code}</div>
          <button className="btn" onClick={leaveRoom} disabled={busy}>Leave</button>
        </div>
        <div className="space" />
        {state.error ? (
          <>
            <div className="subtitle" style={{ color: "var(--color-error)" }}>{state.error}</div>
            <div className="space" />
          </>
        ) : null}
        <div className="title">Players</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {players.map((p) => (
            <li
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                marginBottom: 8,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: p.ready ? "var(--color-success)" : "#d1d5db",
                  }}
                />
                <strong>{p.name}</strong>
                {p.name === state.playerName ? <span className="badge">You</span> : null}
              </div>
              <span style={{ color: p.ready ? "var(--color-success)" : "#6b7280" }}>
                {p.ready ? "Ready" : "Not ready"}
              </span>
            </li>
          ))}
        </ul>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={toggleReady} disabled={busy}>
            {you?.ready ? "Set Not Ready" : "I'm Ready"}
          </button>
          <button className="btn" onClick={startGame} disabled={!allReady || busy}>
            Start Game
          </button>
        </div>

        {!allReady ? (
          <>
            <div className="space" />
            <div className="subtitle">Waiting for all players to be ready…</div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function pickColor(i) {
  const colors = ["red", "blue", "green", "yellow"];
  return colors[i % colors.length];
}
