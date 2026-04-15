import React from "react";

export default function GlassClock({ timeText, theme = "dark" }) {
  const isDark = theme === "dark";

  return (
    <div
      style={{
        ...styles.wrap,
        ...(isDark ? styles.wrapDark : styles.wrapLight),
      }}
      title="Local time"
      aria-label={`Local time ${timeText}`}
    >
      <span style={styles.gloss} aria-hidden="true" />
      <span
        style={{
          ...styles.timeText,
          color: isDark ? "rgba(255,255,255,0.92)" : "rgba(20,29,50,0.92)",
          textShadow: isDark ? "0 0 12px rgba(255,255,255,0.15)" : "0 0 10px rgba(76,127,255,0.18)",
        }}
      >
        {timeText}
      </span>
    </div>
  );
}

const styles = {
  wrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 78,
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    overflow: "hidden",
    backdropFilter: "blur(16px) saturate(1.15)",
    WebkitBackdropFilter: "blur(16px) saturate(1.15)",
    transition: "background 320ms ease, border-color 320ms ease, box-shadow 320ms ease",
  },
  wrapDark: {
    border: "1px solid rgba(255,255,255,0.16)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 24px rgba(0,0,0,0.35)",
  },
  wrapLight: {
    border: "1px solid rgba(22,45,93,0.14)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.68), rgba(230,240,255,0.42))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75), 0 8px 18px rgba(56,84,131,0.16)",
  },
  gloss: {
    position: "absolute",
    top: 0,
    left: "10%",
    width: "80%",
    height: "48%",
    borderRadius: 999,
    background: "linear-gradient(to bottom, rgba(255,255,255,0.34), rgba(255,255,255,0.05))",
    pointerEvents: "none",
    opacity: 0.65,
  },
  timeText: {
    position: "relative",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.22,
    transition: "color 320ms ease, text-shadow 320ms ease",
  },
};
