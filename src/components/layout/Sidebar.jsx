import React from "react";

export default function Sidebar() {
  return (
    <aside
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    />
  );
}
