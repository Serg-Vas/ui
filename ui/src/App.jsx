// App.jsx
import React from "react";

const resource =
  (window.GetParentResourceName && window.GetParentResourceName()) || "ui";

async function post(name) {
  try {
    await fetch(`https://${resource}/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({}),
    });
  } catch {}
}

export default function App() {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: 20,
        zIndex: 999999,
        background: "rgba(0,0,0,0.75)",
        padding: 12,
        borderRadius: 8,
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 8, fontSize: 14 }}>Appearance Test</div>

      <button
        onClick={() => post("presetA")}
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Preset A
      </button>

      <button
        onClick={() => post("presetB")}
        style={{ padding: "6px 10px", cursor: "pointer" }}
      >
        Preset B
      </button>
    </div>
  );
}
