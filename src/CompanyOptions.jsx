import React from "react";
import { useNavigate } from "react-router-dom";

export default function CompanyOptions({ onSelectCompany }) {
  const navigate = useNavigate();

  const companies = [
    {
      id: "synercore",
      name: "Synercore",
      link: "https://synercore.com.ph",
      logo: "/synercore-logo.png", // from public/
      desc: "Heavy Industries / Operations",
    },
    {
      id: "sy3",
      name: "SY3 Energy",
      link: "https://sy3.com.ph",
      logo: "/vite.svg", // placeholder (you can replace later)
      desc: "Energy / Maintenance Services",
    },
  ];

  function pickCompany(company) {
    onSelectCompany(company);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold">Choose a company</h1>
          <p className="mt-2 opacity-80">Select where you want to continue.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => pickCompany(c)}
              className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={c.logo}
                    alt={`${c.name} logo`}
                    className="h-10 w-10 rounded-xl object-contain bg-white/5 p-2"
                  />
                  <div>
                    <div className="text-xl font-semibold">{c.name}</div>
                    <div className="text-sm opacity-75">{c.desc}</div>
                  </div>
                </div>

                <a
                  href={c.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs opacity-70 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit site
                </a>
              </div>

              <div className="mt-5 text-sm opacity-75">Continue →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
