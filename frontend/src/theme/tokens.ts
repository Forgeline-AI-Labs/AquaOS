/** Design-token type definitions for AquaOS themes. */

export interface ThemeColors {
  background: string;
  foreground: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderSubtle: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeRadii {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  name: string;
  slug: string;
  colors: ThemeColors;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
}
