import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "./ThemeToggle";
import GlassClock from "./GlassClock";

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
  theme = "dark",
  onToggleTheme,
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
  const isDark = theme === "dark";

  const setLangSafe = (next) => {
    if (typeof onLangChange === "function") onLangChange(next);
  };

  return (
    <div style={styles.wrap} aria-label="Top bar">
      <div style={{ ...styles.dock, ...(isDark ? styles.dockDark : styles.dockLight) }}>
        <GlassClock timeText={timeText} theme={theme} />

        <div style={{ ...styles.pill, ...styles.livePill, ...(isDark ? styles.pillDark : styles.pillLight) }} title="Status: Live">
          <span style={styles.liveDot} />
          <span style={{ ...styles.liveLabel, ...(isDark ? styles.liveLabelDark : styles.liveLabelLight) }}>LIVE</span>
        </div>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        <div
          style={{
            ...styles.langGroup,
            ...(isDark ? styles.groupDark : styles.groupLight),
          }}
          title="Language"
        >
          <button
            type="button"
            onClick={() => setLangSafe("en")}
            style={{
              ...styles.langBtn,
              ...(isDark ? styles.langBtnDark : styles.langBtnLight),
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
              ...(isDark ? styles.langBtnDark : styles.langBtnLight),
              ...(isTL ? styles.langOn : null),
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
              style={{ ...styles.profileBtn, ...(isDark ? styles.pillDark : styles.pillLight) }}
              title="Profile (coming soon)"
              disabled
            >
              <span style={{ ...styles.avatar, ...(isDark ? styles.avatarDark : styles.avatarLight) }}>U</span>
              <span style={styles.profileText}>Profile</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={{ ...styles.logoutBtn, ...(isDark ? styles.pillDark : styles.pillLight) }}
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
    transition: "background 320ms ease, border-color 320ms ease, box-shadow 320ms ease",
  },
  dockDark: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10,10,14,0.40)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.55)",
  },
  dockLight: {
    border: "1px solid rgba(22,45,93,0.14)",
    background: "rgba(241,246,255,0.45)",
    boxShadow: "0 14px 44px rgba(37,65,112,0.17)",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    transition: "background 320ms ease, border-color 320ms ease, color 320ms ease",
  },
  pillDark: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.9)",
  },
  pillLight: {
    border: "1px solid rgba(22,45,93,0.16)",
    background: "rgba(255,255,255,0.54)",
    color: "rgba(22,45,93,0.88)",
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
    transition: "color 240ms ease, text-shadow 240ms ease",
  },
  liveLabelDark: {
    color: "rgba(220,255,235,0.95)",
    textShadow: "0 0 10px rgba(34,197,94,0.2)",
  },
  liveLabelLight: {
    color: "rgba(16,80,47,0.92)",
    textShadow: "0 0 8px rgba(34,197,94,0.16)",
  },

  groupDark: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
  },
  groupLight: {
    border: "1px solid rgba(22,45,93,0.16)",
    background: "rgba(255,255,255,0.54)",
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
    transition: "background 240ms ease, color 240ms ease",
  },
  langBtnDark: {
    color: "rgba(255,255,255,0.8)",
  },
  langBtnLight: {
    color: "rgba(22,45,93,0.82)",
  },
  langOn: {
    background: "rgba(0,206,255,0.12)",
    boxShadow: "inset 0 0 0 1px rgba(0,206,255,0.22)",
    color: "rgba(220,250,255,0.95)",
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
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 12,
    transition: "background 240ms ease, border-color 240ms ease, color 240ms ease",
  },
  avatarDark: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "rgba(255,255,255,0.85)",
  },
  avatarLight: {
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(22,45,93,0.18)",
    color: "rgba(22,45,93,0.9)",
  },
  profileText: { opacity: 0.85 },

  logoutBtn: {
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
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
