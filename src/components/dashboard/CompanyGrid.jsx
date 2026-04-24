import React from "react";
import GridSwap from "../shared/GridSwap.jsx";
import CompanyCard from "./CompanyCard.jsx";

const TILE_W = 340;

const gridStyle = {
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

export default function CompanyGrid({
  companies,
  setCompanies,
  activeByCompany,
  demoMode,
  demoData,
  loadingActive,
  draggingId,
  setDraggingId,
  t,
  onViewRequest,
}) {
  return (
    <div style={{ width: "fit-content", margin: "0 auto", background: "transparent", border: 0, boxShadow: "none", overflow: "visible" }}>
      <GridSwap
        items={companies}
        setItems={setCompanies}
        className="dash-grid"
        style={gridStyle}
        swapCooldownMs={90}
        followFactor={0.24}
        innerHitbox={0.82}
        onDragStart={(id) => setDraggingId(id)}
        onDragEnd={() => setDraggingId(null)}
        renderItem={(company, swapApi) => (
          <CompanyCard
            company={company}
            request={demoMode ? demoData[company.id] : activeByCompany[company.id]}
            loadingActive={loadingActive}
            demoMode={demoMode}
            draggingId={draggingId}
            swapApi={swapApi}
            t={t}
            onView={onViewRequest}
          />
        )}
      />
    </div>
  );
}
