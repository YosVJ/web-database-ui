import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function MicrosoftIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block" }}
    >
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function formatTime12h(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

function getGreetingByHour(hour) {
  if (hour >= 5 && hour <= 11) return "Good morning";
  if (hour >= 12 && hour <= 16) return "Good afternoon";
  if (hour >= 17 && hour <= 21) return "Good evening";
  return "Good to see you";
}

async function saveUserProfile(user, provider) {
  if (!user) return;

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: fullName,
    provider: provider || "unknown",
  });

  if (error) throw error;
}

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Theme (dark/light)
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // Live time + greeting
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const greeting = useMemo(() => getGreetingByHour(now.getHours()), [now]);
  const timeText = useMemo(() => formatTime12h(now), [now]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const provider = session.user.app_metadata?.provider || "oauth";
          await saveUserProfile(session.user, provider);
          setMsg("Signed in successfully. Profile synced.");
          setErr("");
        } catch (e) {
          setErr(e?.message || "Signed in, but profile sync failed.");
        }
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        await saveUserProfile(data.user, "email");
        setMsg("Account created. You can now log in.");
        setMode("login");
      } else {
        setMsg("Account created. Check your email to confirm, then log in.");
        setMode("login");
      }
    } catch (e) {
      setErr(e?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      await saveUserProfile(data.user, "email");
      setMsg("Welcome back! Logged in and profile synced.");
    } catch (e) {
      setErr(e?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithMicrosoft = async () => {
    setMsg("");
    setErr("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: window.location.origin },
    });

    if (error) setErr(error.message);
  };

  const isLight = theme === "light";

  const styles = makeStyles(isLight);

  return (
    <div style={styles.page}>
      {/* Top-right LIVE + time + theme toggle */}
      <div style={styles.topBar}>
        <div />
        <div style={styles.topRight}>
          <div style={styles.livePill} title="Status">
            <span style={styles.liveDot} />
            <span>LIVE</span>
            <span style={styles.liveTime}>{timeText}</span>
          </div>

          <button
            type="button"
            onClick={() => setTheme(isLight ? "dark" : "light")}
            style={styles.themeBtn}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {isLight ? "Dark" : "Light"}
          </button>
        </div>
      </div>

      <div style={styles.shell}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.logoWrap}>
            <img
              src="/synercore-logo.png"
              alt="Synercore"
              style={styles.logo}
              draggable={false}
            />
          </div>

          <h1 style={styles.heroTitle}>{greeting}</h1>
          <p style={styles.heroSubtitle}>Log in to continue to Synercore</p>

          <p style={styles.heroNote}>Secure, clean, and ready when you are.</p>
        </section>

        {/* Auth card */}
        <section style={styles.card}>
          <header style={styles.cardHeader}>
            <div style={styles.modeToggle}>
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{ ...styles.pill, ...(mode === "login" ? styles.pillOn : {}) }}
                disabled={loading}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                style={{ ...styles.pill, ...(mode === "signup" ? styles.pillOn : {}) }}
                disabled={loading}
              >
                Sign up
              </button>
            </div>
          </header>

          <button
            type="button"
            onClick={loginWithMicrosoft}
            style={styles.msBtn}
            disabled={loading}
            title="Microsoft SSO via Supabase"
          >
            <span style={styles.msBtnRow}>
              <span>Continue with Microsoft</span>
              <MicrosoftIcon size={14} />
            </span>
          </button>

          <div style={styles.dividerRow}>
            <div style={styles.divider} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.divider} />
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleSignup} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                type="email"
                autoComplete="email"
                style={styles.input}
                required
              />
            </label>

            <label style={styles.label}>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                style={styles.input}
                required
              />
              <span style={styles.help}>Minimum 6 characters.</span>
            </label>

            <button type="submit" style={styles.primaryBtn} disabled={!canSubmit}>
              {loading ? "Working..." : mode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          {msg && <div style={styles.msgOk}>{msg}</div>}
          {err && <div style={styles.msgErr}>{err}</div>}
        </section>
      </div>

      {/* Footer with divider + links */}
      <footer style={styles.footer}>
        <div style={styles.footerLine} />
        <div style={styles.footerLinks}>
          <a href="https://www.synercore.com.ph" target="_blank" rel="noreferrer" style={styles.link}>
            synercore.com.ph
          </a>
          <span style={styles.dotSep}>•</span>
          <a href="https://www.sy3.com.ph" target="_blank" rel="noreferrer" style={styles.link}>
            sy3.com.ph
          </a>
        </div>
      </footer>
    </div>
  );
}

function makeStyles(isLight) {
  const bg = isLight
    ? "radial-gradient(900px 500px at 20% 10%, rgba(120,119,198,0.18), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(56,189,248,0.18), transparent 60%), rgba(248,250,252,1)"
    : "radial-gradient(900px 500px at 20% 10%, rgba(120,119,198,0.18), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(56,189,248,0.18), transparent 60%), rgba(10,10,12,1)";

  const text = isLight ? "rgba(10,10,12,0.92)" : "rgba(255,255,255,0.92)";
  const glass = isLight ? "rgba(10,10,12,0.04)" : "rgba(255,255,255,0.06)";
  const border = isLight ? "1px solid rgba(10,10,12,0.10)" : "1px solid rgba(255,255,255,0.12)";

  return {
    page: {
      minHeight: "100vh",
      position: "relative",
      display: "grid",
      placeItems: "center",
      padding: 24,
      background: bg,
      color: text,
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
    },

    topBar: {
      position: "absolute",
      top: 16,
      right: 16,
      left: 16,
      display: "flex",
      justifyContent: "space-between",
      pointerEvents: "none",
    },
    topRight: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      pointerEvents: "auto",
    },
    livePill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      background: glass,
      border,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 0.3,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "rgba(34,197,94,0.95)",
      boxShadow: "0 0 12px rgba(34,197,94,0.35)",
    },
    liveTime: { opacity: 0.8, fontWeight: 800 },

    themeBtn: {
      padding: "8px 10px",
      borderRadius: 12,
      background: glass,
      border,
      color: "inherit",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: 12,
    },

    shell: {
      width: "min(1000px, 100%)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18,
      alignItems: "center",
    },

    hero: {
      padding: 14,
    },
    logoWrap: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 16,
    },
    logo: {
      maxWidth: 210,
      height: "auto",
      opacity: 0.98,
      filter: isLight ? "none" : "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
    },

    heroTitle: {
      margin: 0,
      fontSize: 36,
      fontWeight: 900,
      letterSpacing: -0.4,
      textAlign: "left",
    },
    heroSubtitle: {
      margin: "10px 0 0",
      fontSize: 14,
      opacity: 0.78,
      textAlign: "left",
    },
    heroNote: {
      marginTop: 14,
      fontSize: 12,
      opacity: 0.7,
    },

    card: {
      borderRadius: 18,
      padding: 18,
      background: glass,
      border,
      boxShadow: isLight ? "0 20px 60px rgba(0,0,0,0.10)" : "0 20px 60px rgba(0,0,0,0.35)",
    },
    cardHeader: { display: "flex", justifyContent: "flex-end", marginBottom: 12 },

    modeToggle: {
      display: "flex",
      padding: 4,
      borderRadius: 999,
      background: glass,
      border,
    },
    pill: {
      border: "none",
      cursor: "pointer",
      padding: "8px 10px",
      borderRadius: 999,
      background: "transparent",
      color: "inherit",
      opacity: 0.75,
      fontSize: 12,
      fontWeight: 800,
    },
    pillOn: {
      background: isLight ? "rgba(10,10,12,0.08)" : "rgba(255,255,255,0.12)",
      opacity: 1,
    },

    msBtn: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border,
      background: glass,
      color: "inherit",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: 13,
    },
    msBtnRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
    },

    dividerRow: { display: "flex", alignItems: "center", gap: 10, margin: "14px 0" },
    divider: { height: 1, flex: 1, background: isLight ? "rgba(10,10,12,0.10)" : "rgba(255,255,255,0.14)" },
    dividerText: { fontSize: 12, opacity: 0.7 },

    form: { display: "grid", gap: 12 },
    label: { display: "grid", gap: 6, fontSize: 12, opacity: 0.9 },
    input: {
      padding: "10px 12px",
      borderRadius: 12,
      border,
      background: isLight ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.25)",
      color: "inherit",
      outline: "none",
    },
    help: { fontSize: 11, opacity: 0.7 },

    primaryBtn: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border: "none",
      background: "rgba(99,102,241,0.85)",
      color: "white",
      cursor: "pointer",
      fontWeight: 900,
    },

    msgOk: {
      marginTop: 12,
      padding: 10,
      borderRadius: 12,
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.18)",
      fontSize: 13,
    },
    msgErr: {
      marginTop: 12,
      padding: 10,
      borderRadius: 12,
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.18)",
      fontSize: 13,
    },

    footer: {
      position: "absolute",
      bottom: 14,
      left: 16,
      right: 16,
      width: "min(720px, calc(100% - 32px))",
      margin: "0 auto",
      background: glass,
      border,
      borderRadius: 14,
      padding: "10px 12px",
      boxShadow: isLight ? "0 20px 60px rgba(0,0,0,0.08)" : "0 20px 60px rgba(0,0,0,0.25)",
    },
    footerLine: { height: 1, background: isLight ? "rgba(10,10,12,0.10)" : "rgba(255,255,255,0.14)", marginBottom: 8 },
    footerLinks: { display: "flex", justifyContent: "center", gap: 10, fontSize: 12, opacity: 0.85 },
    link: { color: "inherit", textDecoration: "none", fontWeight: 800 },
    dotSep: { opacity: 0.6 },

    // Responsive: stack on small screens
    "@media": {}, // (inline styles can't do media queries; if needed, we can do a JS width check later)
  };
}
