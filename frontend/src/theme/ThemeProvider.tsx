"use client";

import { useEffect } from "react";

import { useThemeStore } from "./store";
import { applyTheme } from "./apply";

/**
 * Subscribes to the zustand theme store and applies design-token CSS
 * custom properties to <html> whenever the active theme changes.
 *
 * Mount once in the root layout.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme, document.documentElement);
  }, [theme]);

  return <>{children}</>;
}
