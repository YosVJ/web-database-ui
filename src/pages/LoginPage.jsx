import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Auth from "../Auth.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const rootTheme = document.documentElement.getAttribute("data-theme");
    return (rootTheme || localStorage.getItem("theme") || "dark").toLowerCase() === "light" ? "light" : "dark";
  });
  const isLight = theme === "light";

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data?.session) navigate("/app", { replace: true });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/app", { replace: true });
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [navigate]);

  useEffect(() => {
    const sync = () => {
      const rootTheme = document.documentElement.getAttribute("data-theme");
      const next = (rootTheme || localStorage.getItem("theme") || "dark").toLowerCase();
      setTheme(next === "light" ? "light" : "dark");
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onStorage = (e) => {
      if (e.key === "theme") sync();
    };

    window.addEventListener("storage", onStorage);
    sync();

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div
      className="w-full"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        // space so TopBar dock never overlaps the login UI
        paddingTop: 86,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        background: isLight
          ? "linear-gradient(180deg, rgba(246,251,255,0.44), rgba(236,245,255,0.36))"
          : "transparent",
      }}
    >
      {/* IMPORTANT: Do NOT wrap Auth in another glass panel.
          Auth.jsx already includes the logo/text + form card styling. */}
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          borderRadius: isLight ? 24 : 0,
          padding: isLight ? "18px 18px 22px" : 0,
          background: isLight ? "rgba(245,251,255,0.58)" : "transparent",
          border: isLight ? "1px solid rgba(136,164,204,0.36)" : "none",
          boxShadow: isLight ? "0 14px 30px rgba(66,96,146,0.20)" : "none",
        }}
      >
        <Auth hideLocalDock />
      </div>
    </div>
  );
}
