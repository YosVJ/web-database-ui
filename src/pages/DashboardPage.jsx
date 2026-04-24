import React, { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useLangContext } from "../i18n/langContextStore";
import CompanyGrid from "../components/dashboard/CompanyGrid.jsx";
import { initialCompanies, demoData } from "../data/mockDashboard.js";

const TILE_W = 340;

export default function Dashboard({ firstName: firstNameProp = "" }) {
  const { lang, setLang } = useLangContext();

  const [session, setSession] = useState(null);
  const [activeByCompany, setActiveByCompany] = useState({});
  const [loadingActive, setLoadingActive] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [companyOrder, setCompanyOrder] = useState(initialCompanies);

  const TEXT = useMemo(
    () => ({
      en: {
        welcome: "Welcome,",
        chooseCompany: "Choose a company to continue",
        activeRequest: "Active Request",
        view: "Open",
        blocked: "Blocked",
        due: "Due",
        overdue: "Overdue",
        noActive: "No active request",
        tip: "Tip: drag using the :: handle to reorder tiles.",
      },
      tl: {
        welcome: "Maligayang pagdating,",
        chooseCompany: "Pumili ng kumpanya upang magpatuloy",
        activeRequest: "Aktibong Request",
        view: "Buksan",
        blocked: "Naantala",
        due: "Takdang oras",
        overdue: "Lampas sa takdang oras",
        noActive: "Walang aktibong request",
        tip: "Tip: i-drag gamit ang :: handle para ayusin ang tiles.",
      },
    }),
    []
  );

  const t = useCallback((key) => TEXT?.[lang]?.[key] ?? TEXT.en[key] ?? key, [TEXT, lang]);

  const derivedFirstName = useMemo(() => {
    if (String(firstNameProp || "").trim()) return String(firstNameProp).trim();

    const user = session?.user;
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
    const fromFull = String(fullName).trim().split(" ")[0];
    if (fromFull) return fromFull;

    const emailPrefix = (user?.email || "").split("@")[0];
    return emailPrefix || "User";
  }, [firstNameProp, session?.user]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLanguage() {
      const userId = session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase.from("profiles").select("language").eq("id", userId).maybeSingle();
      if (cancelled) return;

      const next = data?.language;
      if (!error && (next === "en" || next === "tl")) setLang(next);
      else setLang("en");
    }

    loadLanguage();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, setLang]);

  useEffect(() => {
    let cancelled = false;

    async function loadActive() {
      setLoadingActive(true);
      const results = {};

      for (const company of initialCompanies) {
        try {
          const { data, error } = await supabase
            .from("purchase_requests")
            .select("id, pr_no, status, due_at, blocked_reason, next_actor, updated_at, created_at")
            .eq("company_id", company.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (cancelled) return;
          if (!error && data) {
            results[company.id] = {
              ...data,
              prNo: data.pr_no,
              dueAt: data.due_at,
              blockedReason: data.blocked_reason,
              nextActor: data.next_actor,
              updatedAt: data.updated_at,
            };
          }
        } catch (error) {
          // keep loading other companies even if one query fails
          console.warn("Error loading active company request:", error);
        }
      }

      if (!cancelled) {
        setActiveByCompany(results);
        setLoadingActive(false);
      }
    }

    loadActive();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!document.getElementById("dashboard-neon-css")) {
      const s = document.createElement("style");
      s.id = "dashboard-neon-css";
      s.textContent = `
        @media (max-width: 1150px) {
          .dash-grid { grid-template-columns: repeat(2, ${TILE_W}px) !important; }
        }
        @media (max-width: 760px) {
          .dash-grid { grid-template-columns: 1fr !important; justify-items: stretch !important; width: 100% !important; }
        }
      `;
      document.head.appendChild(s);
    }

    if (!document.getElementById("dashboard-urgency-css")) {
      const s = document.createElement("style");
      s.id = "dashboard-urgency-css";
      s.textContent = `
        @keyframes dueShift {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.12); }
        }

        @keyframes overdueBlink {
          0%, 100% { opacity: 0.68; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.28); }
        }

        @keyframes blockedShift {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.10); }
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  function onViewRequest(company, request) {
    console.log("Open FIFO request:", { companyId: company.id, prId: request?.id, prNo: request?.prNo });
  }

  const pageWrap = {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "90px 18px 70px",
    background: "transparent",
    position: "relative",
    overflow: "visible",
    zIndex: 1,
  };

  const inner = {
    width: "100%",
    maxWidth: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
    position: "relative",
    zIndex: 1,
    background: "transparent",
    border: 0,
    boxShadow: "none",
  };

  const header = { width: "100%", textAlign: "center", padding: "0 10px" };

  const titleRow = {
    fontSize: 44,
    fontWeight: 900,
    letterSpacing: "-0.6px",
    margin: 0,
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
  };

  return (
    <div style={pageWrap}>
      <div style={inner}>
        <div style={header}>
          <h1 style={titleRow}>
            <span style={{ color: "var(--title-warm)" }}>{t("welcome")}</span>
            <span
              style={{
                fontWeight: 900,
                color: "var(--title-name)",
                textShadow: "var(--title-shadow)",
              }}
            >
              {derivedFirstName}
            </span>
          </h1>

          <p
            style={{
              fontSize: 16,
              opacity: 0.82,
              margin: "8px 0 0 0",
              color: "var(--text-secondary)",
              fontWeight: 500,
              letterSpacing: "0.2px",
            }}
          >
            {t("chooseCompany")}
          </p>

          <button
            type="button"
            onClick={() => setDemoMode((v) => !v)}
            style={{
              marginTop: 12,
              padding: "6px 12px",
              borderRadius: 999,
              border: demoMode ? "1.5px solid var(--demo-border-on)" : "1px solid var(--demo-border-off)",
              background: demoMode ? "var(--demo-bg-on)" : "var(--demo-bg-off)",
              color: demoMode ? "var(--demo-text-on)" : "var(--demo-text-off)",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 0.2,
              transition: "all 200ms ease",
              boxShadow: demoMode ? "var(--demo-shadow-on)" : "none",
              userSelect: "none",
            }}
          >
            Demo Data: {demoMode ? "ON" : "OFF"}
          </button>
        </div>

        <CompanyGrid
          companies={companyOrder}
          setCompanies={setCompanyOrder}
          activeByCompany={activeByCompany}
          demoMode={demoMode}
          demoData={demoData}
          loadingActive={loadingActive}
          draggingId={draggingId}
          setDraggingId={setDraggingId}
          t={t}
          onViewRequest={onViewRequest}
        />

        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.86, color: "var(--text-secondary)", textAlign: "center" }}>
          {t("tip")}
        </div>
      </div>
    </div>
  );
}
