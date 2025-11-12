import React, { useEffect, useState } from "react";
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
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const list = await apiClient.getRooms().catch(() => []);
        if (!ignore) setRooms(Array.isArray(list) ? list : []);
      } catch {
        // ignore load failure
      }
    })();
    return () => { ignore = true; };
  }, []);

  const normalizeRoomResponse = (res, fallbackCode) => {
    const code = res?.code || fallbackCode;
    const players = res?.players || [];
    return { code: code?.toString().toUpperCase(), players };
  };

  const handleCreate = async () => {
    setErr("");
    if (!name.trim()) {
      setErr("Please enter a player name.");
      return;
    }
    try {
      setLoading(true);
      dispatch({ type: "SET_PLAYER_NAME", name: name.trim() });

      let resp;
      try {
        resp = await apiClient.createRoom({ playerName: name.trim() });
      } catch (e) {
        // fallback mock
        resp = { code: Math.random().toString(36).slice(2, 6).toUpperCase(), players: [{ name: name.trim(), ready: false }] };
      }
      const room = normalizeRoomResponse(resp, resp?.code);
      // ensure current player present
      if (!room.players.find(p => p.name === name.trim())) {
        room.players = [...room.players, { name: name.trim(), ready: false }];
      }
      dispatch({ type: "CREATE_ROOM_SUCCESS", room });
    } catch (e) {
      setErr(e?.message || "Unable to create room");
      dispatch({ type: "SET_ERROR", error: e?.message || "Unable to create room" });
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

      let resp;
      try {
        resp = await apiClient.joinRoom(roomCode.trim(), { playerName: name.trim() });
      } catch (e) {
        // fallback mock
        resp = { code: roomCode.trim().toUpperCase(), players: [{ name: name.trim(), ready: false }] };
      }
      const room = normalizeRoomResponse(resp, roomCode.trim());
      if (!room.players.find(p => p.name === name.trim())) {
        room.players = [...room.players, { name: name.trim(), ready: false }];
      }
      dispatch({ type: "JOIN_ROOM_SUCCESS", room });
    } catch (e) {
      setErr(e?.message || "Unable to join room");
      dispatch({ type: "SET_ERROR", error: e?.message || "Unable to join room" });
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
        <div className="row" style={{ alignItems: "stretch" }}>
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

        {rooms?.length ? (
          <>
            <div className="space" />
            <div className="subtitle">Available rooms</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {rooms.map((r) => (
                <li key={r.code} className="row" style={{ justifyContent: "space-between", padding: "8px 0" }}>
                  <div><strong>{r.name || "Room"}</strong> <span className="badge">{r.code}</span></div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setRoomCode(r.code || ""); }}
                  >
                    Use Code
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}

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
