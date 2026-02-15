import { useEffect, useState } from "react";

/**
 * useTheme
 * - keeps theme in React state (so UI rerenders)
 * - writes to localStorage
 * - applies to <html data-theme="dark|light"> + classList for Tailwind setups
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = (localStorage.getItem("theme") || "dark").toLowerCase();
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Apply globally
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // Optional: if you use Tailwind `dark:` utilities:
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return { theme, setTheme, toggleTheme };
}
