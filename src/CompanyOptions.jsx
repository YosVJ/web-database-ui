// src/CompanyOptions.jsx
import React from "react";
import { motion, useDragControls } from "framer-motion";

const DEFAULT_COMPANIES = [
  { id: "synercore", name: "Synercore", subtitle: "Primary", accent: "cyan", dueAt: null },
  { id: "sy3", name: "SY3 Energy", subtitle: "Energy Services", accent: "blue", dueAt: null },
  { id: "kes", name: "KES Prime", subtitle: "Engineering", accent: "amber", dueAt: null },
  { id: "gen3", name: "Gen3 Toll Packing", subtitle: "Packaging", accent: "magenta", dueAt: null },
  { id: "philweld", name: "Philweld", subtitle: "Manufacturing", accent: "green", dueAt: null },
  { id: "gemotra", name: "Gemotra", subtitle: "Electrical Services", accent: "orange", dueAt: null },
];

function getAccent(accent) {
  switch (accent) {
    case "cyan":
      return { ring: "rgba(0, 220, 255, .55)", glow: "rgba(0, 220, 255, .22)" };
    case "blue":
      return { ring: "rgba(90, 180, 255, .55)", glow: "rgba(90, 180, 255, .20)" };
    case "green":
      return { ring: "rgba(60, 255, 170, .55)", glow: "rgba(60, 255, 170, .18)" };
    case "amber":
      return { ring: "rgba(255, 190, 90, .55)", glow: "rgba(255, 190, 90, .18)" };
    case "orange":
      return { ring: "rgba(255, 140, 90, .55)", glow: "rgba(255, 140, 90, .17)" };
    case "magenta":
      return { ring: "rgba(255, 90, 230, .55)", glow: "rgba(255, 90, 230, .18)" };
    default:
      return { ring: "rgba(255,255,255,.22)", glow: "rgba(255,255,255,.08)" };
  }
}

function swapById(list, aId, bId) {
  const a = list.findIndex((x) => x.id === aId);
  const b = list.findIndex((x) => x.id === bId);
  if (a < 0 || b < 0 || a === b) return list;
  const next = list.slice();
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

function pointInInnerRect(point, rect, innerFactor = 0.55) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const halfW = (rect.width * innerFactor) / 2;
  const halfH = (rect.height * innerFactor) / 2;
  return point.x >= cx - halfW && point.x <= cx + halfW && point.y >= cy - halfH && point.y <= cy + halfH;
}

function computeDeadlineFx(dueAt) {
  if (!dueAt) return { show: false };

  const now = Date.now();
  const dueMs = typeof dueAt === "number" ? dueAt : new Date(dueAt).getTime();
  if (!Number.isFinite(dueMs)) return { show: false };

  const diff = dueMs - now;
  const soonWindow = 12 * 60 * 60 * 1000;

  if (diff > soonWindow) return { show: true, tone: "ok", blinkSec: 0 };

  if (diff >= 0) {
    const t = 1 - Math.max(0, Math.min(1, diff / soonWindow));
    const blinkSec = 1.6 - t * 0.6;
    return { show: true, tone: "due", blinkSec: Number(blinkSec.toFixed(2)) };
  }

  const overdue = Math.min(Math.abs(diff), 72 * 60 * 60 * 1000);
  const t = overdue / (72 * 60 * 60 * 1000);
  const blinkSec = 0.9 - t * 0.62;
  return { show: true, tone: "overdue", blinkSec: Number(Math.max(0.28, blinkSec).toFixed(2)) };
}

function ProgressRing({ value = 0, accent = "cyan" }) {
  const { ring, glow } = getAccent(accent);
  const size = 44;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const dash = Math.max(0, Math.min(100, value));
  const offset = c - (dash / 100) * c;

  return (
    <div style={{ position: "relative", width: size, height: size, userSelect: "none" }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ring}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${glow})`, transition: "stroke-dashoffset 260ms ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: 11,
          fontWeight: 900,
          color: "rgba(255,255,255,0.88)",
          textShadow: "0 0 18px rgba(255,255,255,0.06)",
        }}
      >
        {Math.round(dash)}%
      </div>
    </div>
  );
}

function StatusPill({ label, tone = "neutral" }) {
  const styles = {
    neutral: { border: "1px solid rgba(255,255,255,0.14)", bg: "rgba(255,255,255,0.06)", fg: "rgba(255,255,255,0.80)", glow: "rgba(255,255,255,0.06)" },
    due: { border: "1px solid rgba(90, 180, 255, 0.30)", bg: "rgba(90, 180, 255, 0.10)", fg: "rgba(210, 245, 255, 0.95)", glow: "rgba(90, 180, 255, 0.18)" },
    overdue: { border: "1px solid rgba(255, 90, 90, 0.30)", bg: "rgba(255, 90, 90, 0.10)", fg: "rgba(255, 220, 220, 0.95)", glow: "rgba(255, 90, 90, 0.18)" },
  }[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 0.2,
        border: styles.border,
        background: styles.bg,
        color: styles.fg,
        boxShadow: `0 0 18px ${styles.glow}`,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {label}
    </span>
  );
}

function CompanyTile({ item, onSelect, registerEl, isDragging, onDragStartId, onDragMove, onDragEndId }) {
  const dragControls = useDragControls();
  const { ring, glow } = getAccent(item.accent);

  // ✅ urgency as glow pulse (NO corner box)
  const fx = computeDeadlineFx(item.dueAt);
  const urgencyGlow =
    fx.tone === "overdue" ? "rgba(255, 90, 90, 0.42)" : fx.tone === "due" ? "rgba(90, 180, 255, 0.30)" : glow;

  const urgencyAnim = fx.show && fx.blinkSec > 0 ? `urgencyGlowPulse ${fx.blinkSec}s ease-in-out infinite` : "none";

  return (
    <motion.div
      layout
      layoutId={item.id}
      ref={(el) => registerEl(item.id, el)}
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.16}
      onDragStart={() => onDragStartId(item.id)}
      onDrag={(e, info) => onDragMove(item.id, info.point)}
      onDragEnd={() => onDragEndId(item.id)}
      whileDrag={{ zIndex: 60, scale: 1.04, rotate: 0.4, boxShadow: "0 50px 170px rgba(0,0,0,0.82)" }}
      transition={{ type: "spring", stiffness: 520, damping: 34, mass: 0.9, layout: { type: "spring", stiffness: 520, damping: 34, mass: 0.9 } }}
      style={{
        width: 340,
        position: "relative",
        borderRadius: 18,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(14px)",
        boxShadow: isDragging ? "0 32px 140px rgba(0,0,0,0.74)" : "0 18px 70px rgba(0,0,0,0.50)",
        overflow: "visible",
        transform: "translateZ(0)",
        willChange: "transform",
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
          boxShadow: `inset 0 0 0 1px ${ring}, 0 0 24px ${urgencyGlow}`,
          opacity: 0.55,
          animation: urgencyAnim,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          right: -150,
          top: -150,
          background: `radial-gradient(circle at 40% 40%, ${urgencyGlow}, transparent 65%)`,
          filter: "blur(2px)",
          opacity: 0.85,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.92)", lineHeight: 1.15 }}>{item.name}</div>
          <div style={{ fontSize: 11, opacity: 0.72, marginTop: 3, color: "rgba(255,255,255,0.82)" }}>{item.subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProgressRing value={item.progress ?? 0} accent={item.accent} />

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragControls.start(e);
              e.currentTarget.style.cursor = "grabbing";
            }}
            onPointerUp={(e) => (e.currentTarget.style.cursor = "grab")}
            onPointerCancel={(e) => (e.currentTarget.style.cursor = "grab")}
            title="Drag to reorder"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.85)",
              cursor: "grab",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              userSelect: "none",
              boxShadow: `0 0 18px ${urgencyGlow}`,
            }}
          >
            ::
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.9, color: "rgba(255,255,255,0.86)" }}>Active Request</div>
            <div style={{ marginTop: 4, fontSize: 11, opacity: 0.72, color: "rgba(255,255,255,0.82)" }}>
              {item.request ?? "No active request"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              style={{
                padding: "7px 12px",
                borderRadius: 999,
                border: "1px solid rgba(0,206,255,0.22)",
                background: "rgba(0,206,255,0.10)",
                color: "rgba(220,250,255,0.95)",
                fontSize: 11,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 0 16px rgba(0,206,255,0.16)",
                whiteSpace: "nowrap",
              }}
            >
              Open
            </button>

            {item.statusTone ? <StatusPill label={item.statusLabel} tone={item.statusTone} /> : <StatusPill label="Updated" tone="neutral" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CompanyOptions({ companies, onSelectCompany }) {
  const [items, setItems] = React.useState(() => {
    const base = (companies?.length ? companies : DEFAULT_COMPANIES).map((c, idx) => ({
      ...c,
      progress: c.progress ?? (idx % 2 === 0 ? 25 : 0),
      request: c.request ?? "No active request",
      dueAt:
        c.dueAt ??
        (idx === 2 ? Date.now() + 3 * 60 * 60 * 1000 : idx === 4 ? Date.now() - 5 * 60 * 60 * 1000 : null),
    }));
    return base;
  });

  const elsRef = React.useRef(new Map());
  const rectsRef = React.useRef(new Map());
  const draggingIdRef = React.useRef(null);

  const INNER_HITBOX = 0.55;
  const SWAP_COOLDOWN_MS = 170;

  const lastSwapAtRef = React.useRef(0);
  const lastOverRef = React.useRef(null);

  const registerEl = React.useCallback((id, el) => {
    if (!el) {
      elsRef.current.delete(id);
      rectsRef.current.delete(id);
      return;
    }
    elsRef.current.set(id, el);
    rectsRef.current.set(id, el.getBoundingClientRect());
  }, []);

  const measureAll = React.useCallback(() => {
    for (const [id, el] of elsRef.current.entries()) {
      if (!el) continue;
      rectsRef.current.set(id, el.getBoundingClientRect());
    }
  }, []);

  React.useEffect(() => {
    const t = setTimeout(measureAll, 0);
    const onResize = () => measureAll();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [items, measureAll]);

  const getOverId = React.useCallback(
    (point, excludeId) => {
      for (const [id, r] of rectsRef.current.entries()) {
        if (!r || id === excludeId) continue;
        if (pointInInnerRect(point, r, INNER_HITBOX)) return id;
      }
      return null;
    },
    [INNER_HITBOX]
  );

  const onDragStartId = React.useCallback(
    (id) => {
      draggingIdRef.current = id;
      lastOverRef.current = null;
      lastSwapAtRef.current = 0;
      measureAll();
    },
    [measureAll]
  );

  const onDragMove = React.useCallback(
    (id, point) => {
      if (draggingIdRef.current !== id) return;

      measureAll();
      const overId = getOverId(point, id);

      if (!overId) {
        lastOverRef.current = null;
        return;
      }

      const now = Date.now();
      if (now - lastSwapAtRef.current < SWAP_COOLDOWN_MS) return;
      if (lastOverRef.current === overId) return;

      setItems((prev) => swapById(prev, id, overId));

      lastOverRef.current = overId;
      lastSwapAtRef.current = now;

      setTimeout(measureAll, 0);
    },
    [getOverId, measureAll]
  );

  const onDragEndId = React.useCallback(() => {
    draggingIdRef.current = null;
    lastOverRef.current = null;
    lastSwapAtRef.current = 0;
    setTimeout(measureAll, 0);
  }, [measureAll]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("companyoptions-grid-css-v4")) return;

    const s = document.createElement("style");
    s.id = "companyoptions-grid-css-v4";
    s.textContent = `
      @keyframes urgencyGlowPulse { 0%,100%{ opacity:.45 } 50%{ opacity:1 } }

      @media (max-width: 1150px) {
        .floating-grid { grid-template-columns: repeat(2, 340px) !important; justify-content: center !important; }
      }
      @media (max-width: 760px) {
        .floating-grid { grid-template-columns: 1fr !important; width: 100% !important; justify-content: stretch !important; }
      }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.grid} className="floating-grid">
          {items.map((item) => (
            <CompanyTile
              key={item.id}
              item={item}
              onSelect={onSelectCompany}
              registerEl={registerEl}
              isDragging={draggingIdRef.current === item.id}
              onDragStartId={onDragStartId}
              onDragMove={onDragMove}
              onDragEndId={onDragEndId}
            />
          ))}
        </div>

        <div style={styles.hint}>
          Tip: drag using the <span style={{ fontWeight: 900 }}>::</span> handle. Urgency shows as glow (no corner box).
        </div>
      </div>
    </div>
  );
}

const TILE_W = 340;

const styles = {
  page: { width: "100%", minHeight: "100vh", display: "flex", justifyContent: "center", padding: "24px 14px 40px", position: "relative", overflow: "visible" },
  container: { width: "100%", maxWidth: "none", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", overflow: "visible" },
  grid: { width: "fit-content", display: "grid", gridTemplateColumns: `repeat(3, ${TILE_W}px)`, gap: 18, justifyContent: "center", justifyItems: "center", placeContent: "center", alignItems: "start", overflow: "visible" },
  hint: { marginTop: 14, fontSize: 12, opacity: 0.72, color: "rgba(255,255,255,0.75)", textAlign: "center" },
};
