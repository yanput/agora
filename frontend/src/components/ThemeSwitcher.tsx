import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(prev => !prev)}
      className="fixed top-4 right-4 z-50 bg-gray-300 dark:bg-gray-700 p-2 rounded-full shadow-md transition"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
