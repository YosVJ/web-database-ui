import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Auth from "../Auth.jsx";

export default function LoginPage() {
  const navigate = useNavigate();

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
      }}
    >
      {/* IMPORTANT: Do NOT wrap Auth in another glass panel.
          Auth.jsx already includes the logo/text + form card styling. */}
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <Auth hideLocalDock />
      </div>
    </div>
  );
}
