import React from "react";

const SEX_LABELS = {
  0: "Male",
  1: "Female",
};

export default function Sex({ sex = 0, onSexChange, isChanging = false }) {
  const handleToggle = () => {
    const nextSex = sex === 0 ? 1 : 0;
    onSexChange(nextSex);
  };

  return (
    <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #333" }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Sex</div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
        Current: <span style={{ color: sex === 0 ? "#4a9eff" : "#ff6b9d" }}>{SEX_LABELS[sex]}</span>
      </div>
      <button
        onClick={handleToggle}
        disabled={isChanging}
        style={{
          width: "100%",
          padding: 8,
          borderRadius: 4,
          border: "1px solid #3a3a3a",
          background: isChanging ? "#1a1a1a" : "#222",
          color: isChanging ? "#666" : "#fff",
          cursor: isChanging ? "not-allowed" : "pointer",
          fontWeight: 600,
          opacity: isChanging ? 0.5 : 1,
          transition: "all 0.2s ease",
        }}
      >
        {isChanging ? "Changing..." : `Change to ${SEX_LABELS[sex === 0 ? 1 : 0]}`}
      </button>
    </div>
  );
}
