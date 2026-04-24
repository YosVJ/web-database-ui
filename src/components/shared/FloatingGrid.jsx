// src/ui/FloatingGrid.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * FloatingGrid: HTML5 drag reorder inside a constrained grid, with localStorage persistence.
 * Fixes:
 * - removes stray invalid "grid: {...}" block (was breaking build)
 * - adds missing responsive class on the grid container
 * - keeps grid width fit-content (no "panel")
 */
export default function FloatingGrid({
  companies = [],
  renderCard = (company) => <div>{company.name}</div>,
  onReorder = () => {},
  storageKey = "tempo.companyOptions.order.v1",
}) {
  const [order, setOrder] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const dragId = useRef(null);

  // init order
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setOrder(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to load order from localStorage:", e);
      }
    }
    setOrder(companies.map((c) => c.id));
  }, [companies, storageKey]);

  // persist order
  useEffect(() => {
    if (!order.length) return;
    localStorage.setItem(storageKey, JSON.stringify(order));
    onReorder(order);
  }, [order, onReorder, storageKey]);

  const orderedCompanies = useMemo(() => {
    const map = new Map(companies.map((c) => [c.id, c]));
    const fromOrder = order.map((id) => map.get(id)).filter(Boolean);
    const missing = companies.filter((c) => !order.includes(c.id));
    return [...fromOrder, ...missing];
  }, [companies, order]);

  const handleDragStart = (e, companyId) => {
    dragId.current = companyId;
    setDraggingId(companyId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", companyId);
  };

  const handleDragOver = (e, overCompanyId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!dragId.current || dragId.current === overCompanyId) return;

    setOrder((prev) => {
      const dragIndex = prev.indexOf(dragId.current);
      const overIndex = prev.indexOf(overCompanyId);
      if (dragIndex === -1 || overIndex === -1) return prev;

      const next = [...prev];
      next.splice(dragIndex, 1);
      next.splice(overIndex, 0, dragId.current);
      return next;
    });
  };

  const handleDragEnd = () => {
    dragId.current = null;
    setDraggingId(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleDragEnd();
  };

  const styles = {
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 340px)",
      gap: 18,
      alignItems: "start",
      width: "fit-content",
      maxWidth: "none",
      margin: "0 auto",
      padding: 0,
      overflow: "visible",
      background: "transparent",
      border: "none",
      boxShadow: "none",
      justifyContent: "center",
    },

    cardWrap: {
      position: "relative",
      borderRadius: 18,
      padding: 1,
      userSelect: "none",
      WebkitUserSelect: "none",
      touchAction: "none",
      cursor: "grab",
      animation: "floaty 6s ease-in-out infinite",
      willChange: "transform",
    },

    cardShell: {
      position: "relative",
      zIndex: 2,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(14px)",
      overflow: "hidden",
      boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
      width: "100%",
      maxWidth: 520,
      minHeight: 190,
    },

    aura: {
      position: "absolute",
      inset: -90,
      opacity: 0.40,
      filter: "blur(55px)",
      background:
        "radial-gradient(circle at 30% 30%, rgba(129,96,255,0.45), rgba(0,0,0,0) 55%), radial-gradient(circle at 70% 60%, rgba(0,206,255,0.35), rgba(0,0,0,0) 55%), radial-gradient(circle at 50% 80%, rgba(255,88,205,0.28), rgba(0,0,0,0) 60%)",
      pointerEvents: "none",
    },
  };

  return (
    <>
      <div style={styles.grid} className="floating-grid">
        {orderedCompanies.map((company) => {
          const isDragging = draggingId === company.id;

          return (
            <div
              key={company.id}
              draggable
              onDragStart={(e) => handleDragStart(e, company.id)}
              onDragOver={(e) => handleDragOver(e, company.id)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              style={{
                ...styles.cardWrap,
                animation: isDragging ? "none" : "floaty 6s ease-in-out infinite",
                cursor: isDragging ? "grabbing" : "grab",
                transform: isDragging ? "scale(1.04) rotate(-0.6deg)" : "none",
                opacity: isDragging ? 0.92 : 1,
              }}
            >
              {isDragging && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 18,
                    background: "linear-gradient(135deg, rgba(0,206,255,0.10), rgba(255,88,205,0.06))",
                    filter: "blur(10px)",
                    opacity: 0.65,
                    transform: "translate(10px, 8px)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
              )}

              <div style={{ ...styles.aura, opacity: isDragging ? 0.26 : styles.aura.opacity }} aria-hidden="true" />

              <div
                style={{
                  ...styles.cardShell,
                  boxShadow: isDragging ? "0 34px 120px rgba(0,0,0,0.88)" : styles.cardShell.boxShadow,
                  filter: isDragging ? "brightness(1.10) saturate(1.10)" : "none",
                  border: isDragging ? "1px solid rgba(255,255,255,0.22)" : styles.cardShell.border,
                }}
              >
                {renderCard(company)}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        [draggable="true"] { transition: transform 140ms ease, opacity 140ms ease; }
        [draggable="true"]:active { cursor: grabbing; }
        img { -webkit-user-drag: none; user-drag: none; }

        @media (max-width: 1150px) {
          .floating-grid { grid-template-columns: repeat(2, 340px) !important; width: fit-content !important; }
        }
        @media (max-width: 760px) {
          .floating-grid { grid-template-columns: 1fr !important; width: 100% !important; }
        }
      `}</style>
    </>
  );
}
