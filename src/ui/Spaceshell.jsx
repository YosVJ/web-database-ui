// src/ui/Spaceshell.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../theme/ThemeProvider.jsx";

/**
 * SpaceShell (VIBE + THROTTLE)
 * - Cinematic nebula gradients (CSS)
 * - Canvas starfield + optional meteors
 * - Respects prefers-reduced-motion
 * - Low-end: lowers DPR + fewer stars + meteors off
 * - Pauses when tab hidden
 *
 * Props:
 * - constrain?: boolean (default true)
 * - maxWidth?: number (default 1100)
 * - paddingTop?: number (default 24)
 * - panel?: boolean (default false)
 * - showMeteors?: boolean (default false) // enable on /app only
 */

function usePerfProfile() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [lowEnd] = useState(() => {
    const cores = navigator.hardwareConcurrency || 8;
    const mem = navigator.deviceMemory || 8;
    const conn = navigator.connection;
    const saveData = Boolean(conn?.saveData);
    const eff = conn?.effectiveType || "";
    const slowNet = eff.includes("2g") || eff.includes("3g");
    return saveData || slowNet || cores <= 4 || mem <= 4;
  });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const syncReduced = () => setPrefersReduced(Boolean(mql?.matches));
    syncReduced();
    try {
      mql?.addEventListener("change", syncReduced);
    } catch {
      mql?.addListener?.(syncReduced);
    }

    const onVis = () => setPaused(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      try {
        mql?.removeEventListener("change", syncReduced);
      } catch {
        mql?.removeListener?.(syncReduced);
      }
    };
  }, []);

  const quality = useMemo(() => {
    if (prefersReduced) return "off";
    if (lowEnd) return "lite";
    return "full";
  }, [prefersReduced, lowEnd]);

  return { prefersReduced, lowEnd, paused, quality };
}

export default function SpaceShell({
  children,
  constrain = true,
  maxWidth = 1100,
  paddingTop = 24,
  panel = false,
  showMeteors = false,
}) {
  const canvasRef = useRef(null);
  const { isLight } = useTheme();
  const { paused, quality } = usePerfProfile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const mode = quality;
    const dpr = mode === "lite" ? 1 : Math.min(2, window.devicePixelRatio || 1);

    const state = {
      w: 0,
      h: 0,
      starsFar: [],
      starsMid: [],
      starsNear: [],
      meteors: [],
      lastT: 0,
      lastSpawn: 0,
    };

    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      state.w = w;
      state.h = h;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = (w * h) / (1100 * 700);
      const q = mode === "full" ? 1 : mode === "lite" ? 0.55 : 0.35;

      const farCount = Math.floor(220 * density * q);
      const midCount = Math.floor(140 * density * q);
      const nearCount = Math.floor(80 * density * q);

      const makeStars = (count, sizeMin, sizeMax, alphaMin, alphaMax, drift) =>
        Array.from({ length: count }).map(() => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(sizeMin, sizeMax),
          a: rand(alphaMin, alphaMax),
          tw: rand(0.7, 1.6),
          phase: rand(0, Math.PI * 2),
          drift,
        }));

      state.starsFar = makeStars(farCount, 0.6, 1.4, 0.10, 0.35, 0.10);
      state.starsMid = makeStars(midCount, 0.8, 1.8, 0.15, 0.48, 0.18);
      state.starsNear = makeStars(nearCount, 1.2, 2.6, 0.20, 0.65, 0.28);

      state.meteors = [];
    }

    function drawStars(stars, t, color) {
      ctx.fillStyle = color;
      for (const s of stars) {
        s.x -= s.drift;
        if (s.x < -5) s.x = state.w + 5;

        const tw = (Math.sin(t * s.tw + s.phase) + 1) * 0.5;
        const a = s.a * (0.7 + tw * 0.6);

        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function spawnMeteor() {
      const w = state.w;
      const h = state.h;

      const angle = rand(-0.55, -0.35);
      const speed = rand(900, 1500);
      const len = rand(160, 360);
      const thickness = rand(1.2, 2.4);

      const startX = rand(w * 0.75, w * 1.10);
      const startY = rand(-h * 0.10, h * 0.45);

      state.meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: rand(0.65, 1.15),
        len,
        thickness,
        glow: rand(0.35, 0.55),
      });

      if (state.meteors.length > 12) state.meteors.shift();
    }

    function drawMeteor(m, dt) {
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;

      const p = m.life / m.maxLife;
      const fade = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1;

      const vlen = Math.hypot(m.vx, m.vy) || 1;
      const dx = (m.vx / vlen) * m.len;
      const dy = (m.vy / vlen) * m.len;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0, Math.min(1, fade)) * m.glow;

      const gx = m.x - dx;
      const gy = m.y - dy;

      const grad = ctx.createLinearGradient(gx, gy, m.x, m.y);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.55, "rgba(255,255,255,0.55)");
      grad.addColorStop(1, "rgba(150,220,255,0.65)");

      ctx.strokeStyle = grad;
      ctx.lineWidth = m.thickness;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(140,200,255,0.55)";
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      ctx.restore();
    }

    function tick(ts) {
      if (!running) return;
      if (paused) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (mode === "off" || isLight) {
        ctx.clearRect(0, 0, state.w, state.h);
        raf = requestAnimationFrame(tick);
        return;
      }

      const t = ts / 1000;
      const dt = state.lastT ? Math.min(0.033, t - state.lastT) : 0.016;
      state.lastT = t;

      ctx.clearRect(0, 0, state.w, state.h);

      drawStars(state.starsFar, t, "rgba(255,255,255,1)");
      drawStars(state.starsMid, t, "rgba(210,235,255,1)");
      drawStars(state.starsNear, t, "rgba(255,255,255,1)");

      if (showMeteors && mode === "full") {
        if (t - state.lastSpawn > rand(0.9, 1.8)) {
          state.lastSpawn = t;
          spawnMeteor();
        }

        const next = [];
        for (const m of state.meteors) {
          drawMeteor(m, dt);
          if (m.life < m.maxLife) next.push(m);
        }
        state.meteors = next;
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [showMeteors, paused, quality, isLight]);

  const outer = useMemo(
    () => ({
      position: "relative",
      width: "100vw",
      minHeight: "100vh",
      overflowX: "hidden",
      background: "transparent",
    }),
    []
  );

  const contentWrap = useMemo(
    () => ({
      position: "relative",
      zIndex: 5,
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingTop,
      paddingLeft: 18,
      paddingRight: 18,
      boxSizing: "border-box",
    }),
    [paddingTop]
  );

  const maxWrap = useMemo(
    () => ({
      width: "100%",
      maxWidth: constrain ? maxWidth : "none",
    }),
    [constrain, maxWidth]
  );

  return (
    <div className="space-shell-root light-heaven-shell" style={outer} data-quality={quality}>
      <div className={`space-shell-fixed ${isLight ? "sky-shell-light" : "nebula vignette grain"}`}>
        {isLight ? (
          <>
            <div className="sky-cloud-layer sky-cloud-back" />
            <div className="sky-cloud-layer sky-cloud-mid" />
            <div className="sky-cloud-layer sky-cloud-front" />
          </>
        ) : null}
      </div>

      <canvas
        ref={canvasRef}
        className="space-shell-fixed"
        style={{
          zIndex: 2,
          mixBlendMode: isLight ? "normal" : "screen",
          opacity: quality === "off" || isLight ? 0 : 0.95,
        }}
      />

      <div className="space-shell-content" style={contentWrap}>
        <div style={maxWrap} className={panel ? "space-shell-panel" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
}
