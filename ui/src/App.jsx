// App.jsx
import React from "react";

const resource =
  (window.GetParentResourceName && window.GetParentResourceName()) || "ui";

async function post(name, payload) {
  try {
    await fetch(`https://${resource}/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(payload || {}),
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
        onClick={() =>
          post("appearance:apply", {
            component: {
              componentId: 2,
              drawableId: 15,
              textureId: 0,
              paletteId: 0,
            },
          })
        }
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Hair Style
      </button>

      <button
        onClick={() =>
          post("appearance:apply", {
            hair: { primary: 40, highlight: 40 },
          })
        }
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Hair Tint
      </button>

      <button
        onClick={() =>
          post("appearance:apply", {
            overlay: {
              overlayId: 4,
              index: 1,
              opacity: 1.0,
              colorType: 1,
              primary: 0,
              secondary: 0,
            },
          })
        }
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Makeup
      </button>

      <button
        onClick={() =>
          post("appearance:apply", {
            headBlend: { shapeFirst: 45, skinFirst: 45 },
          })
        }
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Head Blend
      </button>

      <button
        onClick={() =>
          post("appearance:apply", {
            faceFeature: { index: 0, scale: 1 },
          })
        }
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Nose Width
      </button>

      <button
        onClick={() =>
          post("appearance:apply", {
            prop: { propId: 0, drawableId: 5, textureId: 0, attach: true },
          })
        }
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Hat
      </button>

      <button
        onClick={() =>
          post("appearance:apply", {
            prop: { propId: 0, drawableId: -1 },
          })
        }
        style={{ marginRight: 8, padding: "6px 10px", cursor: "pointer" }}
      >
        Clear Hat
      </button>

      <button
        onClick={() => post("appearance:apply", { reset: true })}
        style={{ padding: "6px 10px", cursor: "pointer" }}
      >
        Reset
      </button>
    </div>
  );
}
