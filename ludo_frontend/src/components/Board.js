import React from "react";
import { useAppState } from "../store/AppState";

/**
 * Simple board placeholder with Dice and TurnPanel
 */
export default function Board() {
  const { state, dispatch } = useAppState();
  const players = state.board.players || [];

  const rollDice = () => {
    const val = 1 + Math.floor(Math.random() * 6);
    dispatch({ type: "SET_DICE", value: val });

    // Move to next player's turn (local mock)
    const idx =
      Math.max(
        0,
        players.findIndex((p) => p.name === state.board.currentTurn)
      ) || 0;
    const next = players[(idx + 1) % Math.max(1, players.length)];
    if (next?.name) dispatch({ type: "NEXT_TURN", playerName: next.name });
  };

  const exitToLobby = () => dispatch({ type: "LEAVE_ROOM" });

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="badge">Board • Room {state.room?.code}</div>
        <button className="btn" onClick={exitToLobby}>Exit</button>
      </div>
      <div className="space" />
      <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <LudoBoard />
        <div>
          <TurnPanel current={state.board.currentTurn} players={players} />
          <div className="space" />
          <Dice value={state.board.diceValue} onRoll={rollDice} />
        </div>
      </div>
    </div>
  );
}

function LudoBoard() {
  // Stylized placeholder representing a 3x3 with colored corners and center cross
  return (
    <div
      aria-label="Ludo board"
      style={{
        aspectRatio: "1/1",
        width: "100%",
        borderRadius: 16,
        background:
          "conic-gradient(from 45deg, #ef4444 0 25%, #2563EB 0 50%, #10b981 0 75%, #F59E0B 0 100%)",
        position: "relative",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 16,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.95))",
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            width: "75%",
            height: "75%",
            border: "4px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            overflow: "hidden",
          }}
        >
          {/* corners */}
          <div style={{ background: "#fee2e2" }} />
          <div style={{ background: "#e5e7eb" }} />
          <div style={{ background: "#dbeafe" }} />
          <div style={{ background: "#e5e7eb" }} />
          <div style={{ background: "#f3f4f6" }} />
          <div style={{ background: "#e5e7eb" }} />
          <div style={{ background: "#dcfce7" }} />
          <div style={{ background: "#e5e7eb" }} />
          <div style={{ background: "#fef3c7" }} />
        </div>
      </div>
    </div>
  );
}

function TurnPanel({ current, players }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="title" style={{ fontSize: 18, marginBottom: 8 }}>
        Turn
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>{current || "—"}</strong>
        <div className="badge" aria-live="polite">Playing</div>
      </div>

      <div className="space" />
      <div className="subtitle">Players</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {players.map((p) => (
          <li key={p.name} style={{ padding: "6px 0" }}>
            {p.name}
            <span
              style={{
                marginLeft: 8,
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colorToHex(p.color),
                border: "1px solid #d1d5db",
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dice({ value, onRoll }) {
  return (
    <div className="card" style={{ padding: 16, textAlign: "center" }}>
      <div className="subtitle">Dice</div>
      <div
        role="img"
        aria-label="dice face"
        style={{
          width: 80,
          height: 80,
          margin: "12px auto",
          borderRadius: 12,
          border: "2px solid #e5e7eb",
          display: "grid",
          placeItems: "center",
          background: "#fff",
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {value || "—"}
      </div>
      <button className="btn" onClick={onRoll}>Roll</button>
    </div>
  );
}

function colorToHex(c) {
  switch (c) {
    case "red":
      return "#ef4444";
    case "blue":
      return "#2563EB";
    case "green":
      return "#10b981";
    case "yellow":
      return "#F59E0B";
    default:
      return "#9ca3af";
  }
}
