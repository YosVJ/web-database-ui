import React, { useState } from "react";

export default function Dashboard({ session, onLogout }) {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const companies = [
    {
      id: "synercore",
      name: "Synercore",
      desc: "Primary",
    },
    {
      id: "sy3",
      name: "SY3 Energy",
      desc: "Energy Services",
    },
    {
      id: "kes",
      name: "KES Prime",
      desc: "Engineering",
    },
    {
      id: "verdant",
      name: "Verdant",
      desc: "Environmental",
    },
  ];

  const theme = localStorage.getItem("theme") || "dark";

  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      theme === "light"
        ? "radial-gradient(900px 500px at 20% 10%, rgba(99,102,241,0.14), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(56,189,248,0.14), transparent 60%), rgba(245,246,248,1)"
        : "radial-gradient(900px 500px at 20% 10%, rgba(120,119,198,0.18), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(56,189,248,0.18), transparent 60%), rgba(10,10,12,1)",
    color: theme === "light" ? "rgba(10,10,12,0.92)" : "rgba(255,255,255,0.92)",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
  };

  const containerStyle = {
    width: "100%",
    maxWidth: 760,
    textAlign: "center",
  };

  const headerStyle = {
    marginBottom: "36px",
  };

  const welcomeStyle = {
    fontSize: "32px",
    fontWeight: 900,
    letterSpacing: "-0.3px",
    margin: "0 0 4px 0",
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  };

  const welcomeNameStyle = {
    fontWeight: 900,
  };

  const subtextStyle = {
    fontSize: "14px",
    opacity: 0.75,
    margin: "8px 0 0 0",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginBottom: "40px",
  };

  const cardStyle = {
    padding: "20px",
    borderRadius: "16px",
    border: theme === "light" ? "1px solid rgba(10,10,12,0.12)" : "1px solid rgba(255,255,255,0.12)",
    background: theme === "light" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
  };

  const cardHoverStyle = {
    ...cardStyle,
    border: theme === "light" ? "1px solid rgba(10,10,12,0.18)" : "1px solid rgba(255,255,255,0.18)",
    background: theme === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.10)",
  };

  const cardNameStyle = {
    fontSize: "18px",
    fontWeight: 700,
    margin: "0 0 6px 0",
  };

  const cardDescStyle = {
    fontSize: "13px",
    opacity: 0.7,
    margin: 0,
  };

  const footerDividerStyle = {
    height: "1px",
    background: theme === "light" ? "rgba(10,10,12,0.12)" : "rgba(255,255,255,0.14)",
    marginBottom: "16px",
  };

  const footerStyle = {
    fontSize: "12px",
    opacity: 0.7,
    marginBottom: "8px",
  };

  const logoutBtnStyle = {
    marginTop: "12px",
    padding: "8px 12px",
    borderRadius: "8px",
    border: theme === "light" ? "1px solid rgba(10,10,12,0.12)" : "1px solid rgba(255,255,255,0.12)",
    background: theme === "light" ? "rgba(10,10,12,0.06)" : "rgba(255,255,255,0.08)",
    color: "inherit",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    transition: "all 0.2s ease",
  };

  const handleCardClick = (company) => {
    setSelectedCompany(company);
    // Placeholder action - ready for future implementation
    console.log("Selected company:", company);
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Welcome Header */}
        <div style={headerStyle}>
          <h1 style={welcomeStyle}>
            <span>Welcome,</span>
            <span style={welcomeNameStyle}>
              {session?.user?.user_metadata?.full_name || session?.user?.email || "User"}
            </span>
          </h1>
          <p style={subtextStyle}>Choose a company to continue</p>
        </div>

        {/* Company Cards */}
        <div style={gridStyle}>
          {companies.map((company) => (
            <div
              key={company.id}
              style={selectedCompany?.id === company.id ? cardHoverStyle : cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = theme === "light" ? "1px solid rgba(10,10,12,0.18)" : "1px solid rgba(255,255,255,0.18)";
                e.currentTarget.style.background = theme === "light" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.10)";
              }}
              onMouseLeave={(e) => {
                if (selectedCompany?.id !== company.id) {
                  e.currentTarget.style.border = theme === "light" ? "1px solid rgba(10,10,12,0.12)" : "1px solid rgba(255,255,255,0.12)";
                  e.currentTarget.style.background = theme === "light" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.06)";
                }
              }}
              onClick={() => handleCardClick(company)}
            >
              <h3 style={cardNameStyle}>{company.name}</h3>
              <p style={cardDescStyle}>{company.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={footerDividerStyle} />
        <div style={footerStyle}>
          Signed in as <span style={{ fontWeight: 700 }}>{session?.user?.email}</span>
        </div>
        <button style={logoutBtnStyle} onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
