import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // TopBar is in src/ui, so go up one

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

  // ✅ NEW: controlled theme from App
  theme = "dark",
  onToggleTheme,
}) {
  const [now, setNow] = useState(() => new Date());
  const [session, setSession] = useState(null);

  // clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // session (to decide whether to show Profile/Logout)
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

  const setLangSafe = (next) => {
    if (typeof onLangChange === "function") onLangChange(next);
  };

  const isDark = theme === "dark";

  return (
    <div style={styles.wrap} aria-label="Top bar">
      <div style={styles.dock}>
        {/* Time pill */}
        <div style={styles.pill} title="Local time">
          <span style={styles.timeText}>{timeText}</span>
        </div>

        {/* LIVE pill */}
        <div style={{ ...styles.pill, ...styles.livePill }} title="Status: Live">
          <span style={styles.liveDot} />
          <span style={styles.liveLabel}>LIVE</span>
        </div>

        {/* Theme toggle (controlled) */}
        <button
          type="button"
          onClick={() => (typeof onToggleTheme === "function" ? onToggleTheme() : null)}
          style={styles.btn}
          title="Toggle theme"
        >
          {isDark ? "Dark" : "Light"}
        </button>

        {/* Language toggle */}
        <div style={styles.langGroup} title="Language">
          <button
            type="button"
            onClick={() => setLangSafe("en")}
            style={{
              ...styles.langBtn,
              ...(isEN ? styles.langOn : null),
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
              ...(isTL ? styles.langOn : null),
              opacity: langSaving ? 0.7 : 1,
              cursor: langSaving ? "not-allowed" : "pointer",
            }}
            disabled={langSaving}
          >
            TL
          </button>
        </div>

        {/* Only show after login */}
        {session ? (
          <>
            <button type="button" style={styles.profileBtn} title="Profile (coming soon)" disabled>
              <span style={styles.avatar}>U</span>
              <span style={styles.profileText}>Profile</span>
            </button>

            <button type="button" onClick={onLogout} style={styles.logoutBtn} title="Logout">
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
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10,10,14,0.40)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.55)",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
  },

  timeText: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.92)",
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
    color: "rgba(220,255,235,0.95)",
  },

  btn: {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.90)",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },

  langGroup: {
    display: "inline-flex",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  langBtn: {
    padding: "8px 10px",
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.80)",
    fontWeight: 900,
    fontSize: 12,
  },
  langOn: {
    background: "rgba(0,206,255,0.12)",
    color: "rgba(220,250,255,0.95)",
    boxShadow: "inset 0 0 0 1px rgba(0,206,255,0.22)",
  },

  profileBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.70)",
    fontWeight: 900,
    fontSize: 12,
    cursor: "not-allowed",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontWeight: 900,
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  profileText: { opacity: 0.85 },

  logoutBtn: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  },
};

// inject keyframes once
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
