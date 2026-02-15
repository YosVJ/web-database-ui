import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AppHome() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) return;
      setEmail(data?.user?.email ?? "");
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Company Options</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <p style={{ opacity: 0.8 }}>
        Authenticated as: <strong>{email || "Unknown"}</strong>
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button disabled>Purchasing</button>
        <button disabled>Accounting</button>
        <button disabled>Warehouse</button>
      </div>

      <p style={{ opacity: 0.7, marginTop: 16 }}>
        Routing proof page only. Database-first workflow comes next.
      </p>
    </div>
  );
}
