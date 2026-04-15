import React from "react";

export const LangContext = React.createContext({
  lang: "en",
  setLang: async () => {},
  langSaving: false,
});

export function useLangContext() {
  const context = React.useContext(LangContext);
  if (!context) throw new Error("useLangContext must be used within LangProvider");
  return context;
}

export function normalizeLang(v) {
  return v === "tl" ? "tl" : "en";
}
