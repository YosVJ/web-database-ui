import React from "react";
import SpaceShell from "./SpaceShell.jsx";
import TopBar from "./TopBar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function PageLayout({
  children,
  showMeteors = true,
  panel = false,
  paddingTop = 0,
  constrain = false,
  maxWidth,
  lang,
  onLangChange,
  langSaving,
  onLogout,
}) {
  return (
    <SpaceShell showMeteors={showMeteors} panel={panel} paddingTop={paddingTop} constrain={constrain} maxWidth={maxWidth}>
      <Sidebar />
      <TopBar
        lang={lang}
        onLangChange={onLangChange}
        langSaving={langSaving}
        onLogout={onLogout}
      />
      {children}
    </SpaceShell>
  );
}
