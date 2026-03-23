import type { Theme } from "./tokens";

import reef from "@/themes/reef.json";
import minimalLight from "@/themes/minimal-light.json";

/** All bundled themes, keyed by slug. */
export const themes: Record<string, Theme> = {
  reef: reef as Theme,
  "minimal-light": minimalLight as Theme,
};

export const DEFAULT_THEME_SLUG = "reef";
