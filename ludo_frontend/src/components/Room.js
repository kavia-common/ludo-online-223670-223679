import React, { useMemo, useState } from "react";
import { useAppState } from "../store/AppState";
import apiClient from "../services/apiClient";

/**
 * Room: shows players, allows toggling ready and starting game when all ready.
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

  const toggleReady = async () => {
    setBusy(true);
    try {
      // optimistic update
      const updated = players.map((p) =>
        p.name === state.playerName ? { ...p, ready: !p.ready } : p
      );
      dispatch({ type: "UPDATE_ROOM", room: { players: updated } });

      try {
        await apiClient.post(`/rooms/${state.room.code}/ready`, {
          playerName: state.playerName,
          ready: !you?.ready,
        });
      } catch {
        // ignore backend absence
      }
    } finally {
      setBusy(false);
    }
  };

  const startGame = async () => {
    if (!allReady) return;
    setBusy(true);
    try {
      let startPayload = { players: players.map((p, i) => ({ name: p.name, color: pickColor(i) })) };
      try {
        const res = await apiClient.post(`/rooms/${state.room.code}/start`, {});
        if (res?.players) {
          startPayload = { players: res.players };
        }
      } catch {
        // ignore, use mock
      }
      dispatch({
        type: "START_GAME",
        players: startPayload.players,
        currentTurn: startPayload.players?.[0]?.name || state.playerName,
      });
    } finally {
      setBusy(false);
    }
  };

  const leaveRoom = () => {
    dispatch({ type: "LEAVE_ROOM" });
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="badge">Room • {state.room?.code}</div>
          <button className="btn" onClick={leaveRoom}>Leave</button>
        </div>
        <div className="space" />
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
