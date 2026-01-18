import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ company, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <p className="mt-2 opacity-80">
          Selected company:{" "}
          <span className="font-semibold">{company?.name ?? "None"}</span>
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="rounded-xl px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/15 transition"
            onClick={() => navigate("/companies")}
          >
            Switch Company
          </button>

          <button
            className="rounded-xl px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/15 transition"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
