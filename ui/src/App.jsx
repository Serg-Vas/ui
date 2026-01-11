import React, { useEffect, useMemo, useState } from "react";
import { COMPONENT_NAMES, HEAD_OVERLAYS, FACE_FEATURES, EYE_COLORS, MALE_HEAD_TYPES, FEMALE_HEAD_TYPES } from "./data.js";
import { EXCLUDED_COMPONENT_IDS, EXCLUDED_OVERLAY_IDS } from "./exclusions.js";
import Sex from "./Sex.jsx";

const resource = (window.GetParentResourceName && window.GetParentResourceName()) || "ui";

function buildHeadTypeArray(ranges) {
  const max = Math.max(...ranges.flat());

  return Array.from({ length: max + 1 }, (_, v) => v)
    .filter(v => ranges.some(([a, b]) => v >= a && v <= b))
    .map((value, index) => ({ index, value }));
}

const MALE_HEAD_VALUES = buildHeadTypeArray(MALE_HEAD_TYPES.ranges);
const FEMALE_HEAD_VALUES = buildHeadTypeArray(FEMALE_HEAD_TYPES.ranges);

async function post(name, payload) {
  try {
    await fetch(`https://${resource}/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(payload || {}),
    });
  } catch {}
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function App() {
  const [components, setComponents] = useState(() => {
    const init = {};
    for (let i = 0; i <= 11; i++) {
      init[i] = { drawableId: 0, textureId: 0 };
    }
    return init;
  });
  const [hair, setHair] = useState({ primary: 0, highlight: 0 });
  const [overlays, setOverlays] = useState({});
  const [faceFeatures, setFaceFeatures] = useState({});
  const [headBlend, setHeadBlend] = useState({ shapeFirst: 0, skinFirst: 0 });
  const [eyeColor, setEyeColor] = useState(0);
  const [info, setInfo] = useState(null);
  const [sex, setSex] = useState(null);
  const [sexApplied, setSexApplied] = useState(false);
  const [isChangingSex, setIsChangingSex] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      const msg = event.data;
      if (!msg || msg.type !== "appearance:info") return;
      setInfo(msg.payload || null);
      if (msg.payload?.sex !== undefined) {
        setSex(msg.payload.sex);
      }
      setIsChangingSex(false);
      
      if (msg.payload?.components) {
        setComponents((prev) => {
          const next = { ...prev };
          msg.payload.components.forEach((comp) => {
            const compId = Number(comp.componentId);
            next[compId] = {
              drawableId: comp.drawable,
              textureId: comp.texture,
              drawableCount: comp.drawableCount,
              textureCount: comp.textureCount,
            };
          });
          return next;
        });
      }

      // Update hair color from hair component
      if (msg.payload?.components) {
        const hairComp = msg.payload.components.find((c) => c.componentId === 2);
        if (hairComp) {
          setHair({
            primary: hairComp.hairColor ?? 0,
            highlight: hairComp.hairHighlight ?? 0,
          });
        }
      }

      // Update overlays
      if (msg.payload?.overlays) {
        const next = {};
        msg.payload.overlays.forEach((overlay) => {
          next[overlay.key] = {
            overlayId: overlay.overlayId,
            count: overlay.count,
            value: overlay.value,
            opacity: overlay.opacity,
            colorType: overlay.colorType,
            firstColor: overlay.firstColor,
            secondColor: overlay.secondColor,
          };
        });
        setOverlays(next);
      }

      // Update face features
      if (msg.payload?.faceFeatures) {
        const next = {};
        msg.payload.faceFeatures.forEach((feature) => {
          next[feature.index] = feature.scale;
        });
        setFaceFeatures(next);
      }

      // Update head blend
      if (msg.payload?.headBlend) {
        setHeadBlend({
          shapeFirst: msg.payload.headBlend.shapeFirst ?? 0,
          skinFirst: msg.payload.headBlend.skinFirst ?? 0,
        });
      }

      // Update eye color
      if (msg.payload?.eyeColor !== undefined) {
        setEyeColor(msg.payload.eyeColor);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const styles = useMemo(
    () => ({
      root: { position: "fixed", inset: 0, pointerEvents: "none" },
      panel: {
        position: "absolute",
        top: 20,
        left: 20,
        pointerEvents: "auto",
        background: "#191616ff",
        color: "#fff",
        padding: 12,
        borderRadius: 8,
        maxHeight: "90vh",
        overflowY: "auto",
        minWidth: 560,
        userSelect: "none",
      },
      section: { marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #333" },
      row: { display: "flex", alignItems: "center", gap: 6, marginTop: 6, pointerEvents: "auto" },
      label: { fontWeight: 700 },
      button: {
        width: 24,
        height: 22,
        borderRadius: 4,
        border: "1px solid #3a3a3a",
        background: "#222",
        color: "#fff",
        cursor: "pointer",
        pointerEvents: "auto",
      },
      value: { fontSize: 12, opacity: 0.8, textAlign: "center" },
      grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, pointerEvents: "auto" },
      input: { flex: 1, pointerEvents: "auto", cursor: "pointer", width: "100%" },
    }),
    []
  );

  function applyComponent(componentId, patch) {
    setComponents((prev) => {
      const next = {
        ...prev,
        [componentId]: { ...prev[componentId], ...patch },
      };
      post("appearance:apply", {
        component: {
          componentId,
          drawable: next[componentId].drawableId,
          texture: next[componentId].textureId,
          palette: 0,
        },
      });
      return next;
    });
  }

  function applyHairColor(patch) {
    setHair((prev) => {
      const next = { ...prev, ...patch };
      post("appearance:apply", {
        hair: {
          hairColor: next.primary,
          hairHighlight: next.highlight,
        },
      });
      return next;
    });
  }

  function applyOverlay(key, patch) {
    setOverlays((prev) => {
      const next = {
        ...prev,
        [key]: { ...prev[key], ...patch },
      };
      post("appearance:apply", {
        overlay: next[key],
      });
      return next;
    });
  }

  function applyHeadBlend(patch) {
    setHeadBlend((prev) => {
      const next = { ...prev, ...patch };
      post("appearance:apply", {
        headBlend: next,
      });
      return next;
    });
  }

  function applyFaceFeature(index, scale) {
    setFaceFeatures((prev) => {
      const next = { ...prev, [index]: scale };
      post("appearance:apply", {
        faceFeature: { index, scale },
      });
      return next;
    });
  }

  function applySex(nextSex) {
    setSex(nextSex);
    setIsChangingSex(true);
    setSexApplied(true);
    post("appearance:changeSex", { sex: nextSex });
  }

  function applyEyeColor(color) {
    setEyeColor(color);
    post("appearance:apply", {
      eyeColor: color,
    });
  }

  function Slider({ label, value, min, max, step, onChange }) {
    const dec = () => onChange(clamp(Number(value) - step, min, max));
    const inc = () => onChange(clamp(Number(value) + step, min, max));

    return (
      <div style={{ marginBottom: 8 }}>
        <div style={styles.label}>{label}</div>
        <div style={styles.row}>
          <button style={styles.button} onClick={dec} disabled={value <= min}>
            &lt;
          </button>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              console.log("slider change:", e.target.value);
              onChange(Number(e.target.value));
            }}
            style={styles.input}
          />
          <button style={styles.button} onClick={inc} disabled={value >= max}>
            &gt;
          </button>
        </div>
        <div style={styles.value}>{value}</div>
      </div>
    );
  }

  // const componentIds = Array.from({ length: 12 }, (_, i) => i).filter(
  //   (id) => !EXCLUDED_COMPONENT_IDS.includes(id)
  // );

  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>Appearance</h3>
        <Sex sex={sex ?? 0} onSexChange={applySex} isChanging={isChangingSex} />

        {info ? (
          <>
            {sexApplied ? (
              <>
                <div style={styles.section}>
                  <div style={styles.label}>{COMPONENT_NAMES[2].label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
                    Drawable: {components[2]?.drawableId} / {Math.max(0, (components[2]?.drawableCount ?? 1) - 1)} | Texture: {components[2]?.textureId} / {Math.max(0, (components[2]?.textureCount ?? 1) - 1)}
                  </div>
                  <div style={styles.grid}>
                    <Slider
                      label="Drawable"
                      value={components[2]?.drawableId ?? 0}
                      min={0}
                      max={Math.max(0, (components[2]?.drawableCount ?? 1) - 1)}
                      step={1}
                      onChange={(v) => applyComponent(2, { drawableId: v })}
                    />
                    <Slider
                      label="Texture"
                      value={components[2]?.textureId ?? 0}
                      min={0}
                      max={Math.max(0, (components[2]?.textureCount ?? 1) - 1)}
                      step={1}
                      onChange={(v) => applyComponent(2, { textureId: v })}
                    />
                  </div>
                  <div style={styles.grid}>
                    <Slider
                      label="Primary"
                      value={hair.primary}
                      min={0}
                      max={info?.hairColors ? Math.max(0, info.hairColors - 1) : 63}
                      step={1}
                      onChange={(v) => applyHairColor({ primary: v })}
                    />
                    <Slider
                      label="Highlight"
                      value={hair.highlight}
                      min={0}
                      max={info?.hairColors ? Math.max(0, info.hairColors - 1) : 63}
                      step={1}
                      onChange={(v) => applyHairColor({ highlight: v })}
                    />
                  </div>
                </div>


            {info && Object.entries(overlays)
              .filter(([_, overlay]) => !EXCLUDED_OVERLAY_IDS.includes(overlay.overlayId))
              .map(([key, overlay]) => {
              const maxValue = Math.max(0, overlay.count - 1);
              const maxColor = 63; // Standard color limit for makeup/overlay colors
              return (
                <div key={key} style={styles.section}>
                  <div style={styles.label}>{HEAD_OVERLAYS[overlay.overlayId].label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
                    Value: {overlay.value} / {maxValue} | Opacity: {overlay.opacity.toFixed(2)}
                  </div>
                  <div style={styles.grid}>
                    <Slider
                      label="Value"
                      value={overlay.value}
                      min={0}
                      max={maxValue}
                      step={1}
                      onChange={(v) => applyOverlay(key, { value: v })}
                    />
                    <Slider
                      label="Opacity"
                      value={Math.round(overlay.opacity * 100)}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(v) => applyOverlay(key, { opacity: v / 100 })}
                    />
                  </div>
                  <div style={styles.grid}>
                    <Slider
                      label="Color 1"
                      value={overlay.firstColor}
                      min={0}
                      max={maxColor}
                      step={1}
                      onChange={(v) => applyOverlay(key, { firstColor: v })}
                    />
                    <Slider
                      label="Color 2"
                      value={overlay.secondColor}
                      min={0}
                      max={maxColor}
                      step={1}
                      onChange={(v) => applyOverlay(key, { secondColor: v })}
                    />
                  </div>
                </div>
              );
            })}

            <h3 style={{ margin: 0, marginBottom: 8, marginTop: 16 }}>Head Blend</h3>

            {info && (
              <div style={styles.section}>
                <div style={styles.label}>Head Type & Skin</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
                  Head Type: {headBlend.shapeFirst} | Skin: {headBlend.skinFirst}
                </div>
                <div style={styles.grid}>
                  <Slider
                    label="Head Type"
                    value={sex === 1 ? FEMALE_HEAD_VALUES.find(h => h.value === headBlend.shapeFirst)?.index ?? 0 : MALE_HEAD_VALUES.find(h => h.value === headBlend.shapeFirst)?.index ?? 0}
                    min={0}
                    max={sex === 1 ? FEMALE_HEAD_VALUES.length - 1 : MALE_HEAD_VALUES.length - 1}
                    step={1}
                    onChange={(index) => {
                      const headArray = sex === 1 ? FEMALE_HEAD_VALUES : MALE_HEAD_VALUES;
                      const actualValue = headArray[index]?.value ?? 0;
                      applyHeadBlend({ shapeFirst: actualValue });
                    }}
                  />
                  <Slider
                    label="Skin"
                    value={headBlend.skinFirst}
                    min={0}
                    max={45}
                    step={1}
                    onChange={(v) => applyHeadBlend({ skinFirst: v })}
                  />
                </div>
              </div>
            )}

            <h3 style={{ margin: 0, marginBottom: 8, marginTop: 16 }}>Eye Color</h3>

            {info && (
              <div style={styles.section}>
                <div style={styles.label}>Eye Color</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
                  {EYE_COLORS[eyeColor] || `Color ${eyeColor}`}
                </div>
                <Slider
                  label="Color"
                  value={eyeColor}
                  min={0}
                  max={15}
                  step={1}
                  onChange={(v) => applyEyeColor(v)}
                />
              </div>
            )}

            <h3 style={{ margin: 0, marginBottom: 8, marginTop: 16 }}>Face Features</h3>

            {info && Object.entries(faceFeatures).map(([index, scale]) => (
              <div key={`feature-${index}`} style={styles.section}>
                <div style={styles.label}>{FACE_FEATURES[Number(index)].label}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
                  Scale: {(scale * 100).toFixed(0)}% ({scale.toFixed(2)})
                </div>
                <Slider
                  label=""
                  value={Math.round(scale * 100)}
                  min={-100}
                  max={100}
                  step={1}
                  onChange={(v) => applyFaceFeature(Number(index), v / 100)}
                />
              </div>
            ))}
              </>
            ) : (
              <div style={{ padding: 12, textAlign: "center", opacity: 0.6 }}>
                Select sex and apply to continue.
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: 20, textAlign: "center", opacity: 0.5 }}>
            Loading appearance data...
          </div>
        )}
      </div>
    </div>
  );
}
