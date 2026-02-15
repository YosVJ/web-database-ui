import React from "react";
import { supabase } from "./lib/supabaseClient";

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

function normalizeLang(v) {
  return v === "tl" ? "tl" : "en";
}

export function LangProvider({ children }) {
  // 1) fast local preference (no DB needed)
  const [lang, _setLang] = React.useState(() => {
    const stored = localStorage.getItem("lang");
    return normalizeLang(stored);
  });

  const [langSaving, setLangSaving] = React.useState(false);

  // helper: write locally
  const setLangLocal = React.useCallback((nextLang) => {
    const n = normalizeLang(nextLang);
    _setLang(n);
    localStorage.setItem("lang", n);
    return n;
  }, []);

  // 2) on mount + auth changes: sync from profile if available
  React.useEffect(() => {
    let cancelled = false;

    async function syncFromProfile(session) {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (!error && data?.language) {
        const n = normalizeLang(data.language);
        setLangLocal(n);
      }
    }

    // initial session check
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      syncFromProfile(data?.session);
    });

    // keep in sync when auth changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      syncFromProfile(session);
      // if logged out, keep localStorage lang (do nothing)
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, [setLangLocal]);

  // 3) public setter: instant UI + persist to DB if logged in
  const setLang = React.useCallback(
    async (nextLang) => {
      const n = setLangLocal(nextLang);

      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;

      if (!userId) return n;

      setLangSaving(true);
      try {
        await supabase.from("profiles").upsert(
          {
            id: userId,
            language: n,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } finally {
        setLangSaving(false);
      }

      return n;
    },
    [setLangLocal]
  );

  const value = React.useMemo(() => ({ lang, setLang, langSaving }), [lang, setLang, langSaving]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
