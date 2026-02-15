// src/ui/GridSwap.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * GridSwap (LIVE SWAP + SLIDING LAYOUT)
 * - Drag via handle (bindHandle)
 * - While dragging: swaps with the CLOSEST tile under pointer (within inner hitbox)
 * - Framer Motion layout animates the other tiles sliding into place
 * - Ghost follows pointer
 */
export default function GridSwap({
  items,
  setItems,
  renderItem,
  className = "",
  style = {},
  onDragStart,
  onDragEnd,
  swapCooldownMs = 60,
  followFactor = 0.30,
  innerHitbox = 0.92,
  layoutSpring = { type: "spring", stiffness: 520, damping: 34, mass: 0.9 },
}) {
  const tileRefs = useRef(new Map()); // id -> element
  const dragIdRef = useRef(null);
  const lastOverIdRef = useRef(null);
  const lastSwapAtRef = useRef(0);

  const rafRef = useRef(0);
  const pendingMoveRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [ghostSize, setGhostSize] = useState({ w: 0, h: 0 });

  const setTileRef = (id, el) => {
    if (!el) tileRefs.current.delete(id);
    else tileRefs.current.set(id, el);
  };

  const pointInInnerRect = (x, y, r, factor) => {
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const halfW = (r.width * factor) / 2;
    const halfH = (r.height * factor) / 2;
    return x >= cx - halfW && x <= cx + halfW && y >= cy - halfH && y <= cy + halfH;
  };

  // ✅ Choose closest matching tile (not "first match") => feels MUCH easier
  const hitTestOverId = (clientX, clientY, excludeId) => {
    let bestId = null;
    let bestD2 = Infinity;

    for (const [id, el] of tileRefs.current.entries()) {
      if (!el || id === excludeId) continue;
      const r = el.getBoundingClientRect();
      if (!pointInInnerRect(clientX, clientY, r, innerHitbox)) continue;

      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const d2 = dx * dx + dy * dy;

      if (d2 < bestD2) {
        bestD2 = d2;
        bestId = id;
      }
    }

    return bestId;
  };

  const swapByIds = (aId, bId) => {
    if (!aId || !bId || aId === bId) return;

    setItems((prev) => {
      const aIdx = prev.findIndex((x) => x.id === aId);
      const bIdx = prev.findIndex((x) => x.id === bId);
      if (aIdx < 0 || bIdx < 0) return prev;

      const next = prev.slice();
      [next[aIdx], next[bIdx]] = [next[bIdx], next[aIdx]];
      return next;
    });
  };

  const beginDrag = (e, id) => {
    const el = tileRefs.current.get(id);
    if (!el) return;

    const r = el.getBoundingClientRect();

    dragIdRef.current = id;
    lastOverIdRef.current = null;
    lastSwapAtRef.current = 0;

    setDragId(id);
    setIsDragging(true);

    setGhostSize({ w: r.width, h: r.height });
    setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top });
    setGhostPos({ x: r.left, y: r.top });

    onDragStart?.(id);

    if (e.currentTarget?.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const processMove = (e) => {
    if (!isDragging || !dragIdRef.current) return;

    const id = dragIdRef.current;

    const targetX = e.clientX - dragOffset.x;
    const targetY = e.clientY - dragOffset.y;

    setGhostPos((prev) => {
      const k = Math.max(0.01, Math.min(1, followFactor));
      return { x: prev.x + (targetX - prev.x) * k, y: prev.y + (targetY - prev.y) * k };
    });

    const overId = hitTestOverId(e.clientX, e.clientY, id);

    if (!overId) {
      lastOverIdRef.current = null;
      return;
    }

    if (overId !== lastOverIdRef.current) {
      const now = Date.now();
      if (now - lastSwapAtRef.current >= swapCooldownMs) {
        lastSwapAtRef.current = now;
        lastOverIdRef.current = overId;
        swapByIds(id, overId);
      }
    }
  };

  const onPointerMove = (e) => {
    pendingMoveRef.current = e;
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const evt = pendingMoveRef.current;
      pendingMoveRef.current = null;
      if (evt) processMove(evt);
    });
  };

  const endDrag = () => {
    dragIdRef.current = null;
    lastOverIdRef.current = null;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    pendingMoveRef.current = null;

    setIsDragging(false);
    setDragId(null);
    onDragEnd?.();
  };

  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragOffset.x, dragOffset.y, swapCooldownMs, followFactor, innerHitbox]);

  const draggingItem = dragId ? items.find((x) => x.id === dragId) : null;

  return (
    <div style={{ position: "relative", width: "fit-content", overflow: "visible" }}>
      <motion.ul
        className={className}
        style={{ ...style, listStyle: "none", margin: 0, padding: 0 }}
        layout
        transition={layoutSpring}
      >
        {items.map((item) => {
          const active = item.id === dragId;

          const api = {
            isDragging: active,
            bindHandle: () => ({
              onPointerDown: (e) => {
                if (e.button != null && e.button !== 0) return;
                beginDrag(e, item.id);
              },
              style: { touchAction: "none", userSelect: "none", WebkitUserSelect: "none" },
            }),
          };

          return (
            <motion.li
              key={item.id}
              ref={(el) => setTileRef(item.id, el)}
              layout
              transition={layoutSpring}
              style={{
                listStyle: "none",
                opacity: active && isDragging ? 0 : 1,
                transition: "opacity 120ms ease",
              }}
            >
              {renderItem(item, api)}
            </motion.li>
          );
        })}
      </motion.ul>

      {isDragging && draggingItem && (
        <div
          style={{
            position: "fixed",
            left: ghostPos.x,
            top: ghostPos.y,
            width: ghostSize.w,
            height: ghostSize.h,
            zIndex: 9999,
            pointerEvents: "none",
            transform: "scale(1.02)",
            filter: "brightness(1.05) saturate(1.06)",
          }}
        >
          {renderItem(draggingItem, { isDragging: true, bindHandle: () => ({}) })}
        </div>
      )}
    </div>
  );
}
