import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./Auth.jsx";
import Dashboard from "./Dashboard.jsx";
import CompanyOptions from "./CompanyOptions.jsx";

import { supabase } from "./lib/supabaseClient.js";

export default function App() {
  const [session, setSession] = useState(null);

  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem("selected_company");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    // listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  function onSelectCompany(c) {
    setCompany(c);
    localStorage.setItem("selected_company", JSON.stringify(c));
  }

  async function onLogout() {
    localStorage.removeItem("selected_company");
    setCompany(null);
    await supabase.auth.signOut();
  }

  // Simple protection
  function RequireAuth({ children }) {
    if (!session) return <Navigate to="/" replace />;
    return children;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Auth session={session} />} />

        {/* After login, go to companies */}
        <Route
          path="/companies"
          element={
            <RequireAuth>
              <CompanyOptions onSelectCompany={onSelectCompany} />
            </RequireAuth>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard company={company} onLogout={onLogout} />
            </RequireAuth>
          }
        />

        {/* Default redirect */}
        <Route
          path="*"
          element={<Navigate to={session ? "/companies" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
