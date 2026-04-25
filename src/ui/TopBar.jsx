import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "./ThemeToggle";
import GlassClock from "./GlassClock";
import { useTheme } from "../theme/ThemeProvider.jsx";

function formatTime12h(date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TopBar({
  lang = "en",
  onLangChange,
  langSaving = false,
  onLogout,
}) {
  const [now, setNow] = useState(() => new Date());
  const [session, setSession] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session || null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const timeText = useMemo(() => formatTime12h(now), [now]);
  const isEN = lang === "en";
  const isTL = lang === "tl";
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const setLangSafe = (next) => {
    if (typeof onLangChange === "function") onLangChange(next);
  };

  return (
    <div style={styles.wrap} aria-label="Top bar">
      <div style={styles.dock} className="theme-shell">
        <GlassClock timeText={timeText} theme={theme} />

          <div style={{ ...styles.pill, ...styles.livePill }} className="theme-pill top-pill" title="Status: Live">
          <span style={styles.liveDot} />
              <span style={styles.liveLabel}>LIVE</span>
        </div>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />

        <div
          style={{
            ...styles.langGroup,
            ...styles.group,
          }}
          className="top-pill"
          title="Language"
        >
          <button
            type="button"
            onClick={() => setLangSafe("en")}
            style={{
              ...styles.langBtn,
              ...(isEN ? (isDark ? styles.langOnDark : styles.langOnLight) : null),
              opacity: langSaving ? 0.7 : 1,
              cursor: langSaving ? "not-allowed" : "pointer",
            }}
            disabled={langSaving}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLangSafe("tl")}
            style={{
              ...styles.langBtn,
              ...(isTL ? (isDark ? styles.langOnDark : styles.langOnLight) : null),
              opacity: langSaving ? 0.7 : 1,
              cursor: langSaving ? "not-allowed" : "pointer",
            }}
            disabled={langSaving}
          >
            TL
          </button>
        </div>

        {session ? (
          <>
            <button
              type="button"
              style={styles.profileBtn}
              className="top-pill"
              title="Profile (coming soon)"
              disabled
            >
              <span style={styles.avatar}>U</span>
              <span style={styles.profileText}>Profile</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={styles.logoutBtn}
              className="top-pill"
              title="Logout"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    top: 14,
    right: 14,
    zIndex: 2000,
    pointerEvents: "none",
  },
  dock: {
    pointerEvents: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 10px",
    borderRadius: 18,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid var(--app-border)",
    background: "var(--topbar-dock-bg)",
    boxShadow: "var(--topbar-dock-shadow)",
    transition: "background-color 320ms ease, border-color 320ms ease, box-shadow 320ms ease",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid var(--app-border)",
    background: "var(--topbar-pill-bg)",
    color: "var(--topbar-pill-text)",
    transition: "background-color 320ms ease, border-color 320ms ease, color 320ms ease",
  },

  livePill: {
    boxShadow: "0 0 18px rgba(34,197,94,0.14)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "rgba(34,197,94,0.98)",
    boxShadow: "0 0 14px rgba(34,197,94,0.45)",
    animation: "topbarPulse 1.1s ease-in-out infinite",
  },
  liveLabel: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.3,
    color: "var(--live-label-text)",
    textShadow: "var(--live-label-shadow)",
    transition: "color 240ms ease, text-shadow 240ms ease",
  },

  group: {
    border: "1px solid var(--app-border)",
    background: "var(--topbar-pill-bg)",
  },
  langGroup: {
    display: "inline-flex",
    borderRadius: 14,
    overflow: "hidden",
    transition: "background 320ms ease, border-color 320ms ease",
  },
  langBtn: {
    padding: "8px 10px",
    border: "none",
    fontWeight: 900,
    fontSize: 12,
    background: "transparent",
    color: "var(--text-secondary)",
    transition: "background-color 240ms ease, color 240ms ease, box-shadow 240ms ease",
  },
  langOnDark: {
    background: "rgba(0,206,255,0.12)",
    boxShadow: "inset 0 0 0 1px rgba(0,206,255,0.22)",
    color: "rgba(220,250,255,0.95)",
  },
  langOnLight: {
    background: "rgba(36,120,255,0.18)",
    boxShadow: "inset 0 0 0 1px rgba(36,120,255,0.35)",
    color: "rgba(14,42,92,0.98)",
  },

  profileBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    cursor: "not-allowed",
    border: "1px solid var(--app-border)",
    background: "var(--topbar-pill-bg)",
    color: "var(--topbar-pill-text)",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 12,
    background: "var(--topbar-avatar-bg)",
    border: "1px solid var(--app-border)",
    color: "var(--topbar-pill-text)",
    transition: "background-color 240ms ease, border-color 240ms ease, color 240ms ease",
  },
  profileText: { opacity: 0.85 },

  logoutBtn: {
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    border: "1px solid var(--app-border)",
    background: "var(--topbar-pill-bg)",
    color: "var(--topbar-pill-text)",
  },
};

if (typeof document !== "undefined" && !document.getElementById("topbar-keyframes")) {
  const s = document.createElement("style");
  s.id = "topbar-keyframes";
  s.textContent = `
    @keyframes topbarPulse {
      0%, 100% { transform: scale(1); opacity: 0.95; }
      50% { transform: scale(1.35); opacity: 1; }
    }
  `;
  document.head.appendChild(s);
}
