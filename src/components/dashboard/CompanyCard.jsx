import React from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;
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
const TILE_W = 340;

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

function dueChip(dueAt, t) {
  if (!dueAt) return null;
  const dueMs = new Date(dueAt).getTime() - Date.now();
  const absHrs = Math.max(0, Math.floor(Math.abs(dueMs) / (1000 * 60 * 60)));

  if (dueMs < 0) {
    const pulseMs = absHrs <= 2 ? 520 : absHrs <= 6 ? 680 : 900;
    return { kind: "overdue", text: `${t("overdue")} ${absHrs}h`, pulseMs };
  }

  return { kind: "due", text: `${t("due")} ${absHrs}h`, pulseMs: 1400 };
}

function Donut({ percent, accent }) {
  const size = 56;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * c;
  const gap = c - dash;
  const trackColor = "var(--donut-track)";
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

export default function CompanyCard({
  company,
  request,
  loadingActive,
  demoMode,
  draggingId,
  swapApi,
  t,
  onView,
}) {
  const accent = accentFor(company);
  const effectiveReq = request || null;
  const pct = effectiveReq ? progressForStatus(effectiveReq.status) : 0;
  const statusLabel = effectiveReq ? labelForStatus(effectiveReq.status) : t("noActive");
  const due = effectiveReq?.dueAt ? dueChip(effectiveReq.dueAt, t) : null;
  const isBlocked = !!effectiveReq?.blockedReason;
  const chip = isBlocked
    ? { kind: "blocked", text: `${t("blocked")}: ${labelForStatus(effectiveReq.blockedReason)}` }
    : due
    ? { kind: due.kind, text: due.text, pulseMs: due.pulseMs }
    : null;
  const isDragging = draggingId === company.id;
  const floatAnim = !isDragging
    ? { y: [0, -NP.tileFloatAmp, 0, NP.tileFloatAmp, 0], x: [0, 1.2, 0, -1.2, 0] }
    : undefined;

  return (
    <MotionDiv
      className="theme-card"
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
        border: "1px solid var(--tile-border)",
        background: "var(--tile-bg)",
        backdropFilter: "blur(14px)",
        boxShadow: isDragging ? "var(--tile-shadow-drag)" : "var(--tile-shadow)",
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
          boxShadow: `inset 0 0 0 1px ${accent.ring},
                        0 0 ${NP.edgeGlow1}px ${accent.glow},
                        0 0 ${NP.edgeGlow2}px ${accent.glow}`,
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
              textShadow: `0 0 ${NP.textGlow1}px ${accent.glow}, 0 0 ${NP.textGlow2}px ${accent.glow}`,
              fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
              letterSpacing: "0.1px",
            }}
          >
            {company.name}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9, color: "var(--tile-text-subtle)", fontWeight: 600 }}>
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
              border: "1px solid var(--tile-border)",
              background: "var(--tile-handle-bg)",
              color: "var(--tile-handle-text)",
              cursor: isDragging ? "grabbing" : "grab",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              userSelect: "none",
              boxShadow: `0 0 14px ${accent.glow}`,
              touchAction: "none",
            }}
          >
            ::
          </button>
        </div>
      </div>

      <div
        className="theme-shell"
        style={{
          marginTop: 12,
          padding: "12px 12px",
          borderRadius: 14,
          border: `1px solid ${accent.ring}`,
          background: "var(--tile-panel-bg)",
          boxShadow: `0 0 18px ${accent.glow}`,
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
              color: "var(--tile-meta)",
              userSelect: "none",
            }}
          >
            {t("activeRequest")}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(company, effectiveReq);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid var(--tile-border)",
              background: "transparent",
              color: accent.text,
              fontSize: 11,
              fontWeight: 900,
              opacity: 0.95,
              textShadow: `0 0 ${NP.textGlow1}px ${accent.glow}`,
              userSelect: "none",
            }}
            title="Open FIFO request"
          >
            {t("view")}
          </button>
        </div>

        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "var(--tile-text)", lineHeight: 1.2 }}>
              {loadingActive && !demoMode ? "Loading…" : effectiveReq?.prNo ?? "—"}
            </div>

            <div
              className="theme-pill"
              data-pill
              style={{
                marginTop: 4,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 900,
                color: "var(--badge-text)",
                background: "var(--badge-bg)",
                boxShadow: "0 0 10px var(--badge-shadow)",
              }}
            >
              Updated {formatAge(effectiveReq?.updatedAt)}
            </div>

            <div className="theme-stat" data-stat style={{ fontSize: 13, opacity: 0.92, marginTop: 6, lineHeight: 1.35, color: accent.text, fontWeight: 700 }}>
              <div>{statusLabel}</div>
              {effectiveReq?.nextActor ? <div style={{ opacity: 0.85, marginTop: 2 }}>Next: {effectiveReq.nextActor}</div> : null}
            </div>
          </div>

          {chip ? (
            <div
              className="theme-pill"
              data-pill
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 10px",
                borderRadius: 999,
                background: "var(--tile-panel-bg)",
                backdropFilter: "blur(10px)",
                color: "var(--tile-text)",
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
    </MotionDiv>
  );
}
