"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("pmbaobao-theme");
    const enabled = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(enabled);
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("pmbaobao-theme", next ? "dark" : "light");
  }

  return (
    <button
      className="icon-button"
      type="button"
      aria-label="切换主题"
      onClick={toggle}
      title="切换主题"
    >
      {dark ? "☾" : "☼"}
    </button>
  );
}
