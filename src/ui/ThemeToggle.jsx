import React from "react";

const noop = () => {};

export default function ThemeToggle({ theme = "dark", onToggle = noop, disabled = false }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={!isDark}
      onClick={onToggle}
      disabled={disabled}
      style={{
        ...styles.button,
        ...(isDark ? styles.buttonDark : styles.buttonLight),
        ...(disabled ? styles.disabled : null),
      }}
      title={isDark ? "Switch to Light" : "Switch to Dark"}
    >
      <span style={styles.track}>
        <span
          style={{
            ...styles.knob,
            transform: isDark ? "translateX(0px)" : "translateX(24px)",
            background: isDark
              ? "radial-gradient(circle at 30% 30%, #ffe694 0%, #ffca4f 45%, #f3a31f 100%)"
              : "radial-gradient(circle at 30% 30%, #d9e7ff 0%, #b8ccff 45%, #9bb6ff 100%)",
            boxShadow: isDark
              ? "0 0 12px rgba(255, 191, 58, 0.45), inset -4px -4px 6px rgba(173,96,8,0.28)"
              : "0 0 14px rgba(157, 188, 255, 0.45), inset -4px -4px 6px rgba(92, 110, 169, 0.3)",
          }}
        >
          <span style={{ ...styles.knobIcon, opacity: isDark ? 1 : 0, transform: isDark ? "scale(1) rotate(0deg)" : "scale(0.7) rotate(40deg)" }}>
            ☀
          </span>
          <span
            style={{
              ...styles.knobIcon,
              opacity: isDark ? 0 : 1,
              transform: isDark ? "scale(0.7) rotate(-40deg)" : "scale(1) rotate(0deg)",
            }}
          >
            ☾
          </span>
        </span>
      </span>
    </button>
  );
}

const styles = {
  button: {
    border: "1px solid var(--app-border)",
    borderRadius: 999,
    padding: 4,
    width: 58,
    height: 34,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 280ms ease, border-color 280ms ease, box-shadow 280ms ease, opacity 200ms ease",
  },
  buttonDark: {
    background: "var(--topbar-pill-bg)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  buttonLight: {
    background: "var(--topbar-pill-bg)",
    border: "1px solid var(--app-border)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
  },
  track: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  knob: {
    position: "absolute",
    left: 2,
    top: 2,
    width: 26,
    height: 26,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), background 280ms ease, box-shadow 280ms ease",
  },
  knobIcon: {
    position: "absolute",
    lineHeight: 1,
    fontSize: 13,
    transition: "opacity 220ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
    color: "rgba(10,10,12,0.85)",
    userSelect: "none",
  },
  disabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
};
