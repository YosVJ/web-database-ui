import React from "react";
import { supabase } from "./lib/supabaseClient";
import { LangContext, normalizeLang } from "./i18n/langContextStore";

export function LangProvider({ children }) {
  const [lang, _setLang] = React.useState(() => {
    const stored = localStorage.getItem("lang");
    return normalizeLang(stored);
  });

  const [langSaving, setLangSaving] = React.useState(false);

  const setLangLocal = React.useCallback((nextLang) => {
    const n = normalizeLang(nextLang);
    _setLang(n);
    localStorage.setItem("lang", n);
    return n;
  }, []);

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

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      syncFromProfile(data?.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      syncFromProfile(session);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, [setLangLocal]);

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
