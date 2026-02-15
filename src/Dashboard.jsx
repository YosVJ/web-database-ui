// src/Dashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import { useLangContext } from "./LangContext.jsx";
import { motion } from "framer-motion";
import GridSwap from "./ui/GridSwap";
import { createPortal } from "react-dom";

/**
 * Dashboard.jsx (READY-TO-PASTE)
 * ✅ Uses GridSwap ghost-drag (free feeling) + live swap
 * ✅ Drag ONLY via :: handle
 * ✅ REMOVES corner urgency box indicator
 * ✅ Urgency moved to PILL border/glow only:
 *    - Due: subtle color shift (no scaling pulse)
 *    - Overdue: stronger glow + faster blink
 */

export default function Dashboard({ firstName: firstNameProp = "" }) {
  const { lang, setLang } = useLangContext();

  const [session, setSession] = useState(null);
  const [activeByCompany, setActiveByCompany] = useState({});
  const [loadingActive, setLoadingActive] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const [draggingId, setDraggingId] = useState(null);

  const theme = (localStorage.getItem("theme") || "dark").toLowerCase();

  const NEON_PRESET = "cyber";
  const NEON = {
    subtle: {
      edgeOpacity: 0.55,
      edgeGlow1: 18,
      edgeGlow2: 34,
      donutGlow1: 10,
      donutGlow2: 18,
      textGlow1: 10,
      textGlow2: 18,
      blobOpacity: 0.55,
      blobBlur: 14,
      tileFloatAmp: 2.0,
      tileFloatDur: 9.0,
      hoverLift: -3,
    },
    cyber: {
      edgeOpacity: 0.55,
      edgeGlow1: 18,
      edgeGlow2: 38,
      donutGlow1: 12,
      donutGlow2: 22,
      textGlow1: 10,
      textGlow2: 20,
      blobOpacity: 0.85,
      blobBlur: 10,
      tileFloatAmp: 3.2,
      tileFloatDur: 7.4,
      hoverLift: -4,
    },
  };
  const NP = NEON[NEON_PRESET] || NEON.cyber;

  // ---------- Session ----------
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

  // ---------- Companies ----------
  const companies = useMemo(
    () => [
      { id: "synercore", name: "Synercore", desc: "Primary", accent: "purple" },
      { id: "sy3", name: "SY3 Energy", desc: "Energy Services", accent: "cyan" },
      { id: "kes", name: "KES Prime", desc: "Engineering", accent: "amber" },
      { id: "gen3", name: "Gen3 Toll Packing", desc: "Packaging", accent: "magenta" },
      { id: "philweld", name: "Philweld", desc: "Manufacturing", accent: "green" },
      { id: "gemotra", name: "Gemotra", desc: "Electrical Services", accent: "orange" },
    ],
    []
  );

  const [companyOrder, setCompanyOrder] = useState(companies);
  useEffect(() => setCompanyOrder(companies), [companies]);

  // ---------- Demo data ----------
  const demoData = useMemo(
    () => ({
      synercore: {
        id: "req-2025-001",
        prNo: "PR-2025-1024",
        status: "FOR_GM_SELECTION",
        dueAt: new Date(Date.now() + 2 * 864e5).toISOString(),
        blockedReason: null,
        nextActor: "GM - Supplier Selection",
        updatedAt: new Date(Date.now() - 6 * 36e5).toISOString(),
      },
      sy3: {
        id: "req-2025-002",
        prNo: "PR-2025-1025",
        status: "APPROVED_FOR_PO",
        dueAt: new Date(Date.now() + 5 * 36e5).toISOString(),
        blockedReason: null,
        nextActor: "Procurement - Create PO",
        updatedAt: new Date(Date.now() - 3 * 36e5).toISOString(),
      },
      kes: {
        id: "req-2025-003",
        prNo: "PR-2025-1026",
        status: "FOR_DEPT_HEAD_APPROVAL",
        dueAt: new Date(Date.now() - 4 * 36e5).toISOString(),
        blockedReason: null,
        nextActor: "Dept Head - Review & Approve",
        updatedAt: new Date(Date.now() - 12 * 36e5).toISOString(),
      },
      gen3: {
        id: "req-2025-004",
        prNo: "PR-2025-1027",
        status: "DELIVERY_SCHEDULED",
        dueAt: null,
        blockedReason: "DELIVERY_TERMS_NEGOTIATION",
        nextActor: "Supplier - Confirm Terms",
        updatedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
      },
      philweld: {
        id: "req-2025-005",
        prNo: "PR-2025-1028",
        status: "PO_CREATED",
        dueAt: new Date(Date.now() + 8 * 36e5).toISOString(),
        blockedReason: null,
        nextActor: "Supplier - Acknowledge Receipt",
        updatedAt: new Date(Date.now() - 1 * 36e5).toISOString(),
      },
      gemotra: {
        id: "req-2025-006",
        prNo: "PR-2025-1029",
        status: "COSTING_INPUTTED",
        dueAt: new Date(Date.now() + 12 * 36e5).toISOString(),
        blockedReason: null,
        nextActor: "GM - Supplier Selection",
        updatedAt: new Date(Date.now() - 5 * 36e5).toISOString(),
      },
    }),
    []
  );

  // ---------- i18n ----------
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

  // ---------- Name ----------
  const derivedFirstName = useMemo(() => {
    if (String(firstNameProp || "").trim()) return String(firstNameProp).trim();

    const user = session?.user;
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
    const fromFull = String(fullName).trim().split(" ")[0];
    if (fromFull) return fromFull;

    const emailPrefix = (user?.email || "").split("@")[0];
    return emailPrefix || "User";
  }, [firstNameProp, session?.user]);

  // ---------- Load language ----------
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

  // ---------- Load active request per company ----------
  useEffect(() => {
    let cancelled = false;

    async function loadActive() {
      setLoadingActive(true);
      const results = {};

      for (const company of companies) {
        try {
          const { data, error } = await supabase
            .from("purchase_requests")
            .select("id, prNo, status, dueAt, blockedReason, nextActor, updatedAt, created_at")
            .eq("company_id", company.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          if (cancelled) return;
          if (!error && data) results[company.id] = data;
        } catch (e) {
          console.error(`Error loading request for ${company.id}:`, e);
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
  }, [companies]);

  // ---------- Status helpers ----------
  function progressForStatus(status) {
    const s = String(status || "").toUpperCase();
    const map = {
      DRAFT: 5,
      COSTING_INPUTTED: 15,
      FOR_GM_SELECTION: 25,
      GM_SELECTED_SUPPLIER: 35,
      FOR_DEPT_HEAD_APPROVAL: 45,
      FOR_SCM_APPROVAL: 60,
      APPROVED_FOR_PO: 75,
      PO_CREATED: 80,
      DELIVERY_SCHEDULED: 85,
      RECEIVED_PARTIAL: 90,
      RECEIVED_FULL: 95,
      ISSUED_PARTIAL: 98,
      ISSUED_FULL: 99,
      CLOSED: 100,

      INTERNATIONAL_SUPPLIER: 25,
      DELIVERY_TERMS_NEGOTIATION: 25,
      PAYMENT_PROCESSING: 25,
      LOW_URGENCY_DEPRIORITIZED: 25,
      AWAITING_APPROVER: 25,
      WORKFLOW_CHANGED: 25,
      INFO_GAP: 20,
    };
    return map[s] ?? 15;
  }

  function labelForStatus(status) {
    const s = String(status || "").toUpperCase();
    const map = {
      DRAFT: "Draft",
      COSTING_INPUTTED: "Costing prepared",
      FOR_GM_SELECTION: "For GM supplier selection",
      GM_SELECTED_SUPPLIER: "Supplier selected",
      FOR_DEPT_HEAD_APPROVAL: "For Dept Head approval",
      FOR_SCM_APPROVAL: "For SCM approval",
      APPROVED_FOR_PO: "Approved for PO",
      PO_CREATED: "PO created",
      DELIVERY_SCHEDULED: "Delivery scheduled",
      RECEIVED_PARTIAL: "Received (partial)",
      RECEIVED_FULL: "Received (full)",
      ISSUED_PARTIAL: "Issued (partial)",
      ISSUED_FULL: "Issued (full)",
      CLOSED: "Closed",

      INTERNATIONAL_SUPPLIER: "International supplier",
      DELIVERY_TERMS_NEGOTIATION: "Delivery terms negotiation",
      PAYMENT_PROCESSING: "Payment processing",
      LOW_URGENCY_DEPRIORITIZED: "Deprioritized (low urgency)",
      AWAITING_APPROVER: "Awaiting approver",
      WORKFLOW_CHANGED: "Workflow changed",
      INFO_GAP: "Info/coordination gap",
    };
    return map[s] ?? "In progress";
  }

  function formatAge(iso) {
    if (!iso) return "";
    const ms = Date.now() - new Date(iso).getTime();
    const hrs = Math.floor(ms / (1000 * 60 * 60));
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  }

  function dueChip(dueAt) {
    if (!dueAt) return null;
    const dueMs = new Date(dueAt).getTime() - Date.now();
    const absHrs = Math.max(0, Math.floor(Math.abs(dueMs) / (1000 * 60 * 60)));

    if (dueMs < 0) {
      // overdue: faster blink when more overdue
      const pulseMs = absHrs <= 2 ? 520 : absHrs <= 6 ? 680 : 900;
      return { kind: "overdue", text: `${t("overdue")} ${absHrs}h`, pulseMs };
    }
    // due: slow / subtle
    return { kind: "due", text: `${t("due")} ${absHrs}h`, pulseMs: 1400 };
  }

  function accentFor(company) {
    switch (company.accent) {
      case "cyan":
        return { ring: "rgba(0,206,255,0.80)", glow: "rgba(0,206,255,0.45)", text: "rgba(0,242,255,0.99)" };
      case "green":
        return { ring: "rgba(60,255,170,0.80)", glow: "rgba(60,255,170,0.40)", text: "rgba(140,255,210,0.99)" };
      case "amber":
        return { ring: "rgba(255,200,124,0.80)", glow: "rgba(255,200,124,0.40)", text: "rgba(255,230,185,0.99)" };
      case "magenta":
        return { ring: "rgba(255,88,205,0.80)", glow: "rgba(255,88,205,0.40)", text: "rgba(255,155,235,0.99)" };
      case "orange":
        return { ring: "rgba(255,152,0,0.80)", glow: "rgba(255,152,0,0.40)", text: "rgba(255,200,105,0.99)" };
      case "purple":
      default:
        return { ring: "rgba(129,96,255,0.80)", glow: "rgba(129,96,255,0.40)", text: "rgba(175,145,255,0.99)" };
    }
  }

  // ---------- Donut ----------
  function Donut({ percent, accent }) {
    const size = 56;
    const stroke = 8;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;

    const clamped = Math.max(0, Math.min(100, percent));
    const dash = (clamped / 100) * c;
    const gap = c - dash;

    const trackColor = theme === "light" ? "rgba(10,10,12,0.14)" : "rgba(255,255,255,0.12)";
    const neonColor = accent?.text ?? "rgba(0,242,255,0.98)";
    const glow = accent?.glow ?? "rgba(0,206,255,0.45)";

    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{
            transform: "rotate(-90deg)",
            filter: `drop-shadow(0 0 ${NP.donutGlow1}px ${glow}) drop-shadow(0 0 ${NP.donutGlow2}px ${glow})`,
          }}
        >
          <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={neonColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            style={{ transition: "stroke 320ms ease" }}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: "-0.2px",
            color: neonColor,
            textShadow: `0 0 ${NP.textGlow1}px ${glow}, 0 0 ${NP.textGlow2}px ${glow}`,
            userSelect: "none",
          }}
        >
          {Math.round(clamped)}%
        </div>
      </div>
    );
  }

  // ---------- SpaceCloudsPortal (kept; not rendered) ----------
  function SpaceCloudsPortal() {
    if (typeof document === "undefined") return null;

    const blobBase = {
      position: "absolute",
      width: 560,
      height: 560,
      borderRadius: 999,
      filter: `blur(${NP.blobBlur}px)`,
      opacity: NP.blobOpacity,
      pointerEvents: "none",
      mixBlendMode: "screen",
    };

    return createPortal(
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <motion.div
          style={{
            ...blobBase,
            left: "-180px",
            top: "60px",
            background: "radial-gradient(circle at 35% 35%, rgba(129,96,255,0.55), transparent 62%)",
          }}
          animate={{ x: [0, 110, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          style={{
            ...blobBase,
            right: "-200px",
            top: "90px",
            background: "radial-gradient(circle at 35% 35%, rgba(0,206,255,0.50), transparent 62%)",
          }}
          animate={{ x: [0, -140, 0], y: [0, 55, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          style={{
            ...blobBase,
            left: "22%",
            bottom: "-280px",
            background: "radial-gradient(circle at 35% 35%, rgba(255,88,205,0.45), transparent 64%)",
          }}
          animate={{ x: [0, 140, 0], y: [0, -90, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>,
      document.body
    );
  }

  // ---------- Layout + responsive ----------
  const TILE_W = 340;

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

  const grid = {
    display: "grid",
    gridTemplateColumns: `repeat(3, ${TILE_W}px)`,
    gap: 22,
    justifyContent: "center",
    justifyItems: "center",
    alignContent: "center",
    margin: "0 auto",
    width: "fit-content",
    padding: 0,
    listStyle: "none",
    background: "transparent",
    border: 0,
    boxShadow: "none",
    overflow: "visible",
  };

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

    // ✅ urgency animations for pill (NO corner box)
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

  // ---------- Tile ----------
  function CompanyTile({ company, swapApi }) {
    const accent = accentFor(company);
    const glow = accent.glow;
    const ring = accent.ring;

    const req = demoMode ? demoData?.[company.id] : activeByCompany?.[company.id];
    const effectiveReq = req || null;

    const pct = effectiveReq ? progressForStatus(effectiveReq.status) : 0;
    const statusLabel = effectiveReq ? labelForStatus(effectiveReq.status) : t("noActive");
    const due = effectiveReq?.dueAt ? dueChip(effectiveReq.dueAt) : null;
    const isBlocked = !!effectiveReq?.blockedReason;

    const chip = isBlocked
      ? { kind: "blocked", text: `${t("blocked")}: ${labelForStatus(effectiveReq.blockedReason)}` }
      : due
      ? { kind: due.kind, text: due.text, pulseMs: due.pulseMs }
      : null;

    const isDragging = draggingId === company.id;

    const floatAnim =
      !isDragging
        ? { y: [0, -NP.tileFloatAmp, 0, NP.tileFloatAmp, 0], x: [0, 1.2, 0, -1.2, 0] }
        : undefined;

    return (
      <motion.div
        initial={false}
        animate={floatAnim}
        transition={
          !isDragging
            ? { duration: NP.tileFloatDur + (company.id.length % 3), repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        whileHover={!isDragging ? { y: NP.hoverLift } : undefined}
        whileTap={!isDragging ? { scale: 0.998 } : undefined}
        style={{
          width: TILE_W,
          position: "relative",
          borderRadius: 18,
          padding: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(14px)",
          boxShadow: isDragging ? "0 26px 110px rgba(0,0,0,0.72)" : "0 18px 70px rgba(0,0,0,0.50)",
          overflow: "visible",
          transform: "translateZ(0)",
          willChange: "transform",
          opacity: 1,
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 18,
            pointerEvents: "none",
            boxShadow: `inset 0 0 0 1px ${ring},
                        0 0 ${NP.edgeGlow1}px ${glow},
                        0 0 ${NP.edgeGlow2}px ${glow}`,
            opacity: NP.edgeOpacity,
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                marginBottom: 2,
                color: accent.text,
                textShadow: `0 0 ${NP.textGlow1}px ${glow}, 0 0 ${NP.textGlow2}px ${glow}`,
                fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                letterSpacing: "0.1px",
              }}
            >
              {company.name}
            </div>
            <div style={{ fontSize: 13, opacity: 0.78, color: "rgba(200,220,255,0.85)", fontWeight: 600 }}>
              {company.desc}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Donut percent={pct} accent={accent} />

            <button
              type="button"
              {...(swapApi?.bindHandle ? swapApi.bindHandle() : {})}
              title="Drag to reorder"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.85)",
                cursor: isDragging ? "grabbing" : "grab",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                userSelect: "none",
                boxShadow: `0 0 14px ${glow}`,
                touchAction: "none",
              }}
            >
              ::
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "12px 12px",
            borderRadius: 14,
            border: `1px solid ${ring}`,
            background: "rgba(255,255,255,0.03)",
            boxShadow: `0 0 18px ${glow}`,
            minHeight: 118,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div
              style={{
                fontSize: 12,
                opacity: 0.92,
                fontWeight: 900,
                letterSpacing: "0.3px",
                color: "rgba(255,200,124,0.90)",
                userSelect: "none",
              }}
            >
              {t("activeRequest")}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const r = activeByCompany?.[company.id] || demoData?.[company.id];
                console.log("Open FIFO request:", { companyId: company.id, prId: r?.id, prNo: r?.prNo });
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: accent.text,
                fontSize: 11,
                fontWeight: 900,
                opacity: 0.95,
                textShadow: `0 0 ${NP.textGlow1}px ${glow}`,
                userSelect: "none",
              }}
              title="Open FIFO request"
            >
              {t("view")}
            </button>
          </div>

          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "rgba(255,255,255,0.98)", lineHeight: 1.2 }}>
                {loadingActive && !demoMode ? "Loading…" : effectiveReq?.prNo ?? "—"}
              </div>

              <div
                style={{
                  marginTop: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.95)",
                  background: "rgba(255,255,255,0.08)",
                  boxShadow: "0 0 10px rgba(255,255,255,0.12)",
                }}
              >
                Updated {formatAge(effectiveReq?.updatedAt)}
              </div>

              <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.35, color: accent.text, fontWeight: 700 }}>
                <div>{statusLabel}</div>
                {effectiveReq?.nextActor ? <div style={{ opacity: 0.85, marginTop: 2 }}>Next: {effectiveReq.nextActor}</div> : null}
              </div>
            </div>

            {chip ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 10px",
                  borderRadius: 999,

                  // ✅ pill border only
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  color: "rgba(255,255,255,0.92)",
                  fontSize: 11,
                  fontWeight: 850,
                  textAlign: "center",
                  maxWidth: 170,
                  userSelect: "none",

                  border:
                    chip.kind === "overdue"
                      ? "1px solid rgba(255,56,120,0.78)"
                      : chip.kind === "due"
                      ? "1px solid rgba(255,186,0,0.58)"
                      : chip.kind === "blocked"
                      ? "1px solid rgba(255,120,60,0.58)"
                      : "1px solid rgba(0,206,255,0.45)",

                  boxShadow:
                    chip.kind === "overdue"
                      ? "0 0 34px rgba(255,56,120,0.60)"
                      : chip.kind === "due"
                      ? "0 0 20px rgba(255,186,0,0.34)"
                      : chip.kind === "blocked"
                      ? "0 0 22px rgba(255,120,60,0.32)"
                      : "0 0 18px rgba(0,206,255,0.28)",

                  // ✅ animation behavior:
                  // due = subtle color shift (no pulse)
                  // overdue = stronger blink (faster)
                  animation:
                    chip.kind === "overdue"
                      ? `overdueBlink ${Math.max(0.22, (chip.pulseMs ?? 700) / 1000)}s ease-in-out infinite`
                      : chip.kind === "due"
                      ? "dueShift 1.25s ease-in-out infinite"
                      : chip.kind === "blocked"
                      ? "blockedShift 1.35s ease-in-out infinite"
                      : "none",
                }}
                title={chip.text}
              >
                {chip.text}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={pageWrap}>
      {/* Space clouds removed: keep background clean for starfield */}
      <div style={inner}>
        <div style={header}>
          <h1 style={titleRow}>
            <span style={{ color: "rgba(255,200,124,0.95)" }}>{t("welcome")}</span>
            <span
              style={{
                fontWeight: 900,
                color: "rgba(0,232,255,0.98)",
                textShadow: "0 0 22px rgba(129,96,255,0.45), 0 0 16px rgba(0,206,255,0.35)",
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
              color: "rgba(200,220,255,0.85)",
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
              border: demoMode ? "1.5px solid rgba(0,206,255,0.55)" : "1px solid rgba(255,255,255,0.14)",
              background: demoMode ? "rgba(0,206,255,0.14)" : "rgba(255,255,255,0.06)",
              color: demoMode ? "rgba(0,232,255,0.98)" : "rgba(255,255,255,0.70)",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 0.2,
              transition: "all 200ms ease",
              boxShadow: demoMode ? "0 0 16px rgba(0,206,255,0.28)" : "none",
              userSelect: "none",
            }}
          >
            Demo Data: {demoMode ? "ON" : "OFF"}
          </button>
        </div>

        <div style={{ width: "fit-content", margin: "0 auto", background: "transparent", border: 0, boxShadow: "none", overflow: "visible" }}>
          <GridSwap
            items={companyOrder}
            setItems={setCompanyOrder}
            className="dash-grid"
            style={grid}
            swapCooldownMs={90}
            followFactor={0.24}
            innerHitbox={0.82}
            onDragStart={(id) => setDraggingId(id)}
            onDragEnd={() => setDraggingId(null)}
            renderItem={(company, swapApi) => <CompanyTile company={company} swapApi={swapApi} />}
          />
        </div>

        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.72, color: "rgba(255,255,255,0.75)", textAlign: "center" }}>
          {t("tip")}
        </div>
      </div>
    </div>
  );
}
