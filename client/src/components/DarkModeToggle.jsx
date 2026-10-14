import useDarkMode from "../hooks/useDarkMode.js";

// Drop this anywhere, e.g. next to NotificationBell in a header
export default function DarkModeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white p-2 rounded-lg transition"
    >
      {theme === "dark" ? (
        // Sun icon - shown when currently dark, click to go light
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Moon icon - shown when currently light, click to go dark
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
