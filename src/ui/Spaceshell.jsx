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
  const skyRef = useRef(null);
  const { isLight } = useTheme();
  const { paused, quality } = usePerfProfile();

  const STYLE_VERSION = "space-shell-vibe-v8";

  useEffect(() => {
    if (typeof document === "undefined") return;

    const old = Array.from(document.querySelectorAll("style[data-space-shell-style]"));
    old.forEach((n) => n.parentNode?.removeChild(n));

    const s = document.createElement("style");
    s.setAttribute("data-space-shell-style", STYLE_VERSION);
    s.textContent = `
      .space-shell-root {
        position: relative;
        width: 100vw;
        min-height: 100vh;
        overflow-x: hidden;
        background: transparent;
      }

      .space-shell-fixed {
        position: fixed;
        inset: 0;
        pointer-events: none;
      }

      .space-shell-content {
        position: relative;
        z-index: 5;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 100%;
        min-height: 100vh;
        box-sizing: border-box;
      }

      .space-shell-panel {
        width: 100%;
        border-radius: 26px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.10);
        box-shadow: 0 20px 90px rgba(0,0,0,0.55);
        backdrop-filter: blur(16px);
        padding: 22px;
      }

      .nebula {
        background:
          radial-gradient(1200px 800px at 18% 28%, rgba(120,80,255,0.26), rgba(0,0,0,0) 58%),
          radial-gradient(1000px 700px at 78% 34%, rgba(0,206,255,0.18), rgba(0,0,0,0) 60%),
          radial-gradient(900px 700px at 70% 78%, rgba(255,88,205,0.10), rgba(0,0,0,0) 60%),
          radial-gradient(1200px 900px at 30% 80%, rgba(255,180,120,0.06), rgba(0,0,0,0) 60%),
          linear-gradient(180deg, rgba(8,8,12,1) 0%, rgba(6,6,10,1) 100%);
        filter: saturate(1.1) contrast(1.02);
      }

      .vignette::before {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 40%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.88) 100%);
        opacity: 0.90;
      }

      .grain::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E");
        mix-blend-mode: overlay;
        opacity: 0.10;
      }

      .sky-shell-light {
        position: fixed;
        inset: 0;
        overflow: hidden;
        z-index: 1;
        background: linear-gradient(180deg, #f8fbff 0%, #edf5ff 45%, #e8f1fb 100%);
      }

      .sky-shell-light::before {
        content: "";
        position: absolute;
        inset: -8% -12% 52%;
        pointer-events: none;
        background: radial-gradient(1100px 520px at 50% 0%, rgba(255,255,255,0.88), rgba(255,255,255,0) 72%);
        opacity: 0.9;
      }

      .sky-cloud-layer {
        position: absolute;
        inset: -10% -14%;
        pointer-events: none;
        z-index: 2;
        will-change: transform;
        background-repeat: no-repeat;
        --sky-drift-x: 0%;
        --sky-drift-y: 0%;
      }

      .sky-cloud-back {
        opacity: 0.58;
        background:
          radial-gradient(ellipse 30% 10% at 10% 18%, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0.42) 38%, rgba(255,255,255,0) 72%),
          radial-gradient(ellipse 34% 12% at 46% 14%, rgba(255,255,255,0.76) 0%, rgba(255,255,255,0.38) 40%, rgba(255,255,255,0) 74%),
          radial-gradient(ellipse 30% 10% at 84% 20%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.40) 38%, rgba(255,255,255,0) 72%);
        transform: translate3d(
          calc(var(--sky-parallax-x, 0px) * -0.15 + var(--sky-drift-x)),
          calc(var(--sky-parallax-y, 0px) * -0.10 + var(--sky-drift-y)),
          0
        );
        animation: skyCloudDriftBack 84s linear infinite alternate;
      }

      .sky-cloud-mid {
        opacity: 0.70;
        background:
          radial-gradient(ellipse 28% 11% at 14% 40%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.50) 38%, rgba(255,255,255,0) 74%),
          radial-gradient(ellipse 30% 12% at 48% 46%, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.44) 38%, rgba(255,255,255,0) 74%),
          radial-gradient(ellipse 28% 11% at 84% 42%, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.48) 38%, rgba(255,255,255,0) 74%);
        transform: translate3d(
          calc(var(--sky-parallax-x, 0px) * -0.38 + var(--sky-drift-x)),
          calc(var(--sky-parallax-y, 0px) * -0.24 + var(--sky-drift-y)),
          0
        );
        animation: skyCloudDriftMid 58s linear infinite alternate;
      }

      .sky-cloud-front {
        opacity: 0.82;
        background:
          radial-gradient(ellipse 34% 14% at 18% 68%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.56) 36%, rgba(255,255,255,0) 74%),
          radial-gradient(ellipse 30% 13% at 54% 74%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.52) 36%, rgba(255,255,255,0) 74%),
          radial-gradient(ellipse 34% 14% at 90% 66%, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.52) 36%, rgba(255,255,255,0) 74%);
        transform: translate3d(
          calc(var(--sky-parallax-x, 0px) * -0.72 + var(--sky-drift-x)),
          calc(var(--sky-parallax-y, 0px) * -0.40 + var(--sky-drift-y)),
          0
        );
        animation: skyCloudDriftFront 42s linear infinite alternate;
      }

      @keyframes skyCloudDriftBack {
        from { --sky-drift-x: 0%; --sky-drift-y: 0%; }
        to { --sky-drift-x: 4.2%; --sky-drift-y: 1.4%; }
      }

      @keyframes skyCloudDriftMid {
        from { --sky-drift-x: 0%; --sky-drift-y: 0%; }
        to { --sky-drift-x: -6.4%; --sky-drift-y: 1.8%; }
      }

      @keyframes skyCloudDriftFront {
        from { --sky-drift-x: 0%; --sky-drift-y: 0%; }
        to { --sky-drift-x: 8.2%; --sky-drift-y: 2.4%; }
      }

      @media (prefers-reduced-motion: reduce) {
        .sky-cloud-layer {
          animation: none !important;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!isLight || typeof window === "undefined") return undefined;
    const sky = skyRef.current;
    if (!sky) return undefined;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const maxX = 22;
    const maxY = 14;

    const update = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      sky.style.setProperty("--sky-parallax-x", `${cx.toFixed(2)}px`);
      sky.style.setProperty("--sky-parallax-y", `${cy.toFixed(2)}px`);
      raf = window.requestAnimationFrame(update);
    };

    const onPointerMove = (e) => {
      const nx = e.clientX / Math.max(1, window.innerWidth) - 0.5;
      const ny = e.clientY / Math.max(1, window.innerHeight) - 0.5;
      tx = nx * maxX;
      ty = ny * maxY;
    };

    const onPointerLeave = () => {
      tx = 0;
      ty = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    raf = window.requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.cancelAnimationFrame(raf);
    };
  }, [isLight]);

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
      <div ref={skyRef} className={`space-shell-fixed ${isLight ? "sky-shell-light" : "nebula vignette grain"}`}>
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
