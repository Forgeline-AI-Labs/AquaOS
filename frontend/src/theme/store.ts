import { create } from "zustand";

import { themes, DEFAULT_THEME_SLUG } from "./registry";
import type { Theme } from "./tokens";

interface ThemeState {
  slug: string;
  theme: Theme;
  setTheme: (slug: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  slug: DEFAULT_THEME_SLUG,
  theme: themes[DEFAULT_THEME_SLUG],
  setTheme: (slug: string) => {
    const next = themes[slug];
    if (next) {
      set({ slug, theme: next });
    }
  },
}));
