import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { useLangContext } from "./i18n/langContextStore";
import { useTheme } from "./theme/ThemeProvider.jsx";

const TEXT = {
  en: {
    login: "Login",
    signup: "Sign up",
    continueMs: "Continue with Microsoft",
    or: "or",
    email: "Email",
    emailPh: "you@company.com",
    password: "Password",
    passPh: "••••••••",
    minChars: "Minimum 6 characters.",
    loginBtn: "Login",
    signupBtn: "Create account",
    working: "Working...",
    subtitle: "Log in to continue to Synercore",
    note: "Secure, clean, and ready when you are.",
    signedInOk: "Signed in successfully. Profile synced.",
    signedInSyncFail: "Signed in, but profile sync failed.",
    accountCreated: "Account created. You can now log in.",
    checkEmail: "Account created. Check your email to confirm, then log in.",
    welcomeBack: "Welcome back! Logged in and profile synced.",
    signupFailed: "Signup failed.",
    loginFailed: "Login failed.",
    msSsoTitle: "Microsoft SSO via Supabase",
  },
  tl: {
    login: "Mag-login",
    signup: "Mag-sign up",
    continueMs: "Magpatuloy gamit ang Microsoft",
    or: "o",
    email: "Email",
    emailPh: "ikaw@kumpanya.com",
    password: "Password",
    passPh: "••••••••",
    minChars: "Hindi bababa sa 6 na karakter.",
    loginBtn: "Mag-login",
    signupBtn: "Gumawa ng account",
    working: "Sandali…",
    subtitle: "Mag-login upang magpatuloy sa Synercore",
    note: "Ligtas, maayos, at handa kapag ikaw ay handa.",
    signedInOk: "Matagumpay na naka-login. Na-sync ang profile.",
    signedInSyncFail: "Naka-login, pero hindi na-sync ang profile.",
    accountCreated: "Nagawa ang account. Maaari ka nang mag-login.",
    checkEmail: "Nagawa ang account. I-check ang email para i-confirm, pagkatapos mag-login.",
    welcomeBack: "Welcome back! Naka-login at na-sync ang profile.",
    signupFailed: "Hindi nagtagumpay ang pag-sign up.",
    loginFailed: "Hindi nagtagumpay ang pag-login.",
    msSsoTitle: "Microsoft SSO gamit ang Supabase",
  },
};

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
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

/**
 * Auth
 * Props:
 * - hideLocalDock?: boolean
 *   When true, Auth will NOT render any top-right controls.
 *   TopBar should own time/live/theme/lang on BOTH login + app pages.
 */
export default function Auth({ hideLocalDock = false }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // ✅ Language from context (TopBar changes this)
  const { lang } = useLangContext();
  const t = TEXT[lang] || TEXT.en;

  const { isLight } = useTheme();

  // Live time + greeting (displayed in hero only, not in dock)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
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
          setMsg(t.signedInOk);
          setErr("");
        } catch (e) {
          setErr(e?.message || t.signedInSyncFail);
        }
      }
    });

    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]); // rebind messages if language changes

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
        setMsg(t.accountCreated);
        setMode("login");
      } else {
        setMsg(t.checkEmail);
        setMode("login");
      }
    } catch (e) {
      setErr(e?.message || t.signupFailed);
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
      setMsg(t.welcomeBack);
    } catch (e) {
      setErr(e?.message || t.loginFailed);
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

  const styles = makeStyles(isLight);

  return (
    <div style={styles.container}>
      {/* Optional fallback dock (normally OFF via <Auth hideLocalDock /> in LoginPage) */}
      {!hideLocalDock ? (
        <div style={styles.localDock} aria-hidden>
          <div style={styles.localDockPill}>
            <span style={styles.localDot} />
            <span style={styles.localDockLabel}>LIVE</span>
            <span style={styles.localDockTime}>{timeText}</span>
          </div>
        </div>
      ) : null}

      <div style={styles.shell} className="_auth_shell_fix">
        {/* HERO */}
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
          <p style={styles.heroSubtitle}>{t.subtitle}</p>
          <p style={styles.heroNote}>{t.note}</p>
        </section>

        {/* AUTH CARD */}
        <section style={styles.card}>
          <header style={styles.cardHeader}>
            <div style={styles.modeToggle}>
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{
                  ...styles.pill,
                  ...(mode === "login" ? styles.pillOn : {}),
                }}
                disabled={loading}
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                style={{
                  ...styles.pill,
                  ...(mode === "signup" ? styles.pillOn : {}),
                }}
                disabled={loading}
              >
                {t.signup}
              </button>
            </div>
          </header>

          <button
            type="button"
            onClick={loginWithMicrosoft}
            style={styles.msBtn}
            disabled={loading}
            title={t.msSsoTitle}
          >
            <span style={styles.msBtnRow}>
              <span>{t.continueMs}</span>
              <MicrosoftIcon size={14} />
            </span>
          </button>

          <div style={styles.dividerRow}>
            <div style={styles.divider} />
            <span style={styles.dividerText}>{t.or}</span>
            <div style={styles.divider} />
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleSignup} style={styles.form}>
            <label style={styles.label}>
              {t.email}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                type="email"
                autoComplete="email"
                style={styles.input}
                required
              />
            </label>

            <label style={styles.label}>
              {t.password}
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passPh}
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                style={styles.input}
                required
              />
              <span style={styles.help}>{t.minChars}</span>
            </label>

            <button type="submit" style={styles.primaryBtn} disabled={!canSubmit}>
              {loading ? t.working : mode === "login" ? t.loginBtn : t.signupBtn}
            </button>
          </form>

          {msg ? <div style={styles.msgOk}>{msg}</div> : null}
          {err ? <div style={styles.msgErr}>{err}</div> : null}
        </section>
      </div>

      <footer style={styles.footer}>
        <div style={styles.footerLine} />
        <div style={styles.footerLinks}>
          <a
            href="https://www.synercore.com.ph"
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            synercore.com.ph
          </a>
          <span style={styles.dotSep}>•</span>
          <a
            href="https://www.sy3.com.ph"
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            sy3.com.ph
          </a>
        </div>
      </footer>
    </div>
  );
}

function makeStyles(isLight) {
  // IMPORTANT: no "page background" here; SpaceShell provides the background
  const palette = isLight
    ? {
        text: "rgba(18,34,66,0.95)",
        heroSubtitle: "rgba(42,74,124,0.86)",
        heroNote: "rgba(52,82,132,0.74)",
        border: "1px solid rgba(28,57,112,0.16)",
        surface: "linear-gradient(140deg, rgba(255,255,255,0.78), rgba(234,243,255,0.58))",
        surfaceSoft: "rgba(255,255,255,0.62)",
        inputBg: "rgba(255,255,255,0.86)",
        dividerColor: "rgba(41,74,129,0.2)",
        pillOnBg: "rgba(36,120,255,0.2)",
        pillOnText: "rgba(14,42,92,0.98)",
        btnPrimary: "linear-gradient(135deg, rgba(61,131,245,0.94), rgba(82,106,248,0.9))",
        btnPrimaryShadow: "0 10px 22px rgba(69,112,209,0.35)",
        cardShadow: "0 24px 64px rgba(66,99,156,0.2)",
        footShadow: "0 18px 50px rgba(66,99,156,0.16)",
        inputShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
      }
    : {
        text: "rgba(255,255,255,0.92)",
        heroSubtitle: "rgba(255,255,255,0.78)",
        heroNote: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(255,255,255,0.12)",
        surface: "rgba(255,255,255,0.06)",
        surfaceSoft: "rgba(255,255,255,0.06)",
        inputBg: "rgba(0,0,0,0.28)",
        dividerColor: "rgba(255,255,255,0.14)",
        pillOnBg: "rgba(255,255,255,0.12)",
        pillOnText: "rgba(255,255,255,0.96)",
        btnPrimary: "rgba(99,102,241,0.85)",
        btnPrimaryShadow: "0 10px 22px rgba(67,56,202,0.35)",
        cardShadow: "0 20px 60px rgba(0,0,0,0.35)",
        footShadow: "0 20px 60px rgba(0,0,0,0.25)",
        inputShadow: "none",
      };

  return {
    container: {
      width: "100%",
      color: palette.text,
      position: "relative",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      transition: "color 280ms ease",
    },

    localDock: {
      position: "absolute",
      top: 0,
      right: 0,
      pointerEvents: "none",
    },
    localDockPill: {
      pointerEvents: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 999,
      background: palette.surfaceSoft,
      border: palette.border,
      backdropFilter: "blur(14px)",
      fontSize: 12,
      fontWeight: 900,
    },
    localDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      background: "rgba(34,197,94,0.95)",
      boxShadow: "0 0 12px rgba(34,197,94,0.35)",
    },
    localDockLabel: { letterSpacing: 0.25 },
    localDockTime: { opacity: 0.8 },

    shell: {
      width: "min(1040px, 100%)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 22,
      alignItems: "center",
    },

    hero: { padding: 14 },
    logoWrap: { display: "flex", justifyContent: "center", marginBottom: 16 },
    logo: {
      maxWidth: 210,
      height: "auto",
      opacity: 0.98,
      filter: isLight
        ? "drop-shadow(0 10px 22px rgba(99,126,176,0.26))"
        : "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
      transition: "filter 280ms ease",
    },

    heroTitle: {
      margin: 0,
      fontSize: 36,
      fontWeight: 900,
      letterSpacing: -0.4,
      textAlign: "left",
      color: palette.text,
    },
    heroSubtitle: {
      margin: "10px 0 0",
      fontSize: 14,
      opacity: 1,
      textAlign: "left",
      color: palette.heroSubtitle,
    },
    heroNote: { marginTop: 14, fontSize: 12, opacity: 1, color: palette.heroNote },

    card: {
      borderRadius: 18,
      padding: 18,
      background: palette.surface,
      border: palette.border,
      boxShadow: palette.cardShadow,
      backdropFilter: "blur(14px)",
      transition: "background 320ms ease, border-color 320ms ease, box-shadow 320ms ease",
    },
    cardHeader: { display: "flex", justifyContent: "flex-end", marginBottom: 12 },

    modeToggle: {
      display: "flex",
      padding: 4,
      borderRadius: 999,
      background: palette.surfaceSoft,
      border: palette.border,
      backdropFilter: "blur(14px)",
    },
    pill: {
      border: "none",
      cursor: "pointer",
      padding: "8px 10px",
      borderRadius: 999,
      background: "transparent",
      color: "inherit",
      opacity: 0.82,
      fontSize: 12,
      fontWeight: 800,
    },
    pillOn: { background: palette.pillOnBg, color: palette.pillOnText, opacity: 1 },

    msBtn: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border: palette.border,
      background: palette.surfaceSoft,
      color: "inherit",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: 13,
      backdropFilter: "blur(14px)",
    },
    msBtnRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      width: "100%",
    },

    dividerRow: { display: "flex", alignItems: "center", gap: 10, margin: "14px 0" },
    divider: { height: 1, flex: 1, background: palette.dividerColor },
    dividerText: { fontSize: 12, opacity: 0.78 },

    form: { display: "grid", gap: 12 },
    label: { display: "grid", gap: 6, fontSize: 12, opacity: 0.95 },
    input: {
      padding: "10px 12px",
      borderRadius: 12,
      border: palette.border,
      background: palette.inputBg,
      color: "inherit",
      outline: "none",
      boxShadow: palette.inputShadow,
      transition: "background 260ms ease, border-color 260ms ease, box-shadow 260ms ease",
    },
    help: { fontSize: 11, opacity: 0.72 },

    primaryBtn: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 12,
      border: "none",
      background: palette.btnPrimary,
      color: "white",
      cursor: "pointer",
      fontWeight: 900,
      boxShadow: palette.btnPrimaryShadow,
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
      marginTop: 18,
      width: "min(720px, 100%)",
      marginLeft: "auto",
      marginRight: "auto",
      background: palette.surface,
      border: palette.border,
      borderRadius: 14,
      padding: "10px 12px",
      boxShadow: palette.footShadow,
      backdropFilter: "blur(14px)",
      transition: "background 320ms ease, border-color 320ms ease, box-shadow 320ms ease",
    },
    footerLine: { height: 1, background: palette.dividerColor, marginBottom: 8 },
    footerLinks: {
      display: "flex",
      justifyContent: "center",
      gap: 10,
      fontSize: 12,
      opacity: 0.9,
      flexWrap: "wrap",
    },
    link: { color: "inherit", textDecoration: "none", fontWeight: 800 },
    dotSep: { opacity: 0.6 },
  };
}


/* Responsive: stack hero + card on small screens */
if (typeof document !== "undefined" && !document.getElementById("auth-responsive-style")) {
  const s = document.createElement("style");
  s.id = "auth-responsive-style";
  s.textContent = `
    @media (max-width: 980px) {
      ._auth_shell_fix { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(s);
}
