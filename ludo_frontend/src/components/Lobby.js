import React, { useState } from "react";
import { useAppState } from "../store/AppState";
import apiClient from "../services/apiClient";

/**
 * Lobby screen: enter player name, create or join a room.
 */
export default function Lobby() {
  const { state, dispatch } = useAppState();
  const [name, setName] = useState(state.playerName || "");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleCreate = async () => {
    setErr("");
    if (!name.trim()) {
      setErr("Please enter a player name.");
      return;
    }
    try {
      setLoading(true);
      dispatch({ type: "SET_PLAYER_NAME", name: name.trim() });

      // Attempt backend call if available; fallback to local mock
      let code = "";
      try {
        const res = await apiClient.post("/rooms", { playerName: name.trim() });
        code = res?.code;
      } catch {
        // fallback code
        code = Math.random().toString(36).slice(2, 6).toUpperCase();
      }
      dispatch({ type: "CREATE_ROOM", code });
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setErr("");
    if (!name.trim()) {
      setErr("Please enter a player name.");
      return;
    }
    if (!roomCode.trim()) {
      setErr("Please enter a room code.");
      return;
    }
    try {
      setLoading(true);
      dispatch({ type: "SET_PLAYER_NAME", name: name.trim() });

      let players = [];
      try {
        const res = await apiClient.post(`/rooms/${roomCode.trim()}/join`, {
          playerName: name.trim(),
        });
        players = res?.players || [];
      } catch {
        // mock two players
        players = [{ name: name.trim(), ready: false }];
      }
      dispatch({ type: "JOIN_ROOM", code: roomCode.trim().toUpperCase(), players });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="badge">Ocean Professional</div>
        <h1 className="title">Ludo Online</h1>
        <p className="subtitle">Create a room or join an existing one to start playing.</p>

        <div className="space" />
        <label htmlFor="playerName">Player name</label>
        <input
          id="playerName"
          className="input"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="space" />
        <div className="row">
          <button className="btn" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </button>

          <input
            className="input"
            placeholder="Room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={8}
            style={{ maxWidth: 180 }}
          />
          <button className="btn btn-secondary" onClick={handleJoin} disabled={loading}>
            {loading ? "Joining..." : "Join Room"}
          </button>
        </div>

        {err ? (
          <>
            <div className="space" />
            <div style={{ color: "var(--color-error)", fontWeight: 600 }}>{err}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
