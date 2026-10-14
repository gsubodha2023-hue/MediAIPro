import { useEffect, useState } from "react";

const STORAGE_KEY = "mediai-theme";

const getInitialTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  // Fall back to the OS-level preference if the user hasn't chosen yet
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export default function useDarkMode() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
}
