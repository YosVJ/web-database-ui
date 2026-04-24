// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import LoginPage from "./pages/LoginPage.jsx";
import Dashboard from "./Dashboard.jsx";
import RequireAuth from "./routes/RequireAuth.jsx";
import PageLayout from "./components/layout/PageLayout.jsx";
import SpaceShell from "./components/layout/SpaceShell.jsx";
import { LangProvider } from "./LangContext.jsx";
import { useLangContext } from "./i18n/langContextStore";
import { supabase } from "./lib/supabaseClient";

function AppContent() {
  const { lang, setLang, langSaving } = useLangContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />

        <Route
          path="/login"
          element={
            <SpaceShell showMeteors={false} panel={false} paddingTop={24} constrain maxWidth={1100}>
              <LoginPage />
            </SpaceShell>
          }
        />

        <Route
          path="/app"
          element={
            <PageLayout
              showMeteors={true}
              panel={false}
              paddingTop={0}
              constrain={false}
              lang={lang}
              onLangChange={setLang}
              langSaving={langSaving}
              onLogout={handleLogout}
            >
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            </PageLayout>
          }
        />

        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
      <SpeedInsights />
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppContent />
    </LangProvider>
  );
}
