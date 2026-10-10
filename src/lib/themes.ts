import { z } from "zod";

export type ThemeColors = {
  background: string;
  card: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  destructive: string;
  destructiveForeground: string;
};

export type Theme = {
  id: string;
  name: string;
  colors: ThemeColors;
  isBuiltIn?: boolean;
};

export const DEFAULT_LIGHT_THEME: Theme = {
  id: "built-in-light",
  name: "Lys",
  isBuiltIn: true,
  colors: {
    background: "oklch(0.975 0.015 85)",
    card: "oklch(0.995 0.008 85)",
    foreground: "oklch(0.25 0.03 40)",
    primary: "oklch(0.62 0.17 35)",
    primaryForeground: "oklch(0.99 0.01 85)",
    muted: "oklch(0.94 0.02 85)",
    mutedForeground: "oklch(0.48 0.04 50)",
    accent: "oklch(0.82 0.1 135)",
    accentForeground: "oklch(0.25 0.05 140)",
    border: "oklch(0.88 0.03 60)",
    destructive: "oklch(0.58 0.22 25)",
    destructiveForeground: "oklch(0.99 0.01 85)",
  },
};

export const DEFAULT_DARK_THEME: Theme = {
  id: "built-in-dark",
  name: "Mørk",
  isBuiltIn: true,
  colors: {
    background: "oklch(0.129 0.042 264.695)",
    card: "oklch(0.208 0.042 265.755)",
    foreground: "oklch(0.984 0.003 247.858)",
    primary: "oklch(0.929 0.013 255.508)",
    primaryForeground: "oklch(0.208 0.042 265.755)",
    muted: "oklch(0.279 0.041 260.031)",
    mutedForeground: "oklch(0.704 0.04 256.788)",
    accent: "oklch(0.279 0.041 260.031)",
    accentForeground: "oklch(0.984 0.003 247.858)",
    border: "oklch(1 0 0 / 10%)",
    destructive: "oklch(0.704 0.191 22.216)",
    destructiveForeground: "oklch(0.984 0.003 247.858)",
  },
};

export const DEFAULT_THEMES: Theme[] = [DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME];

export const themeColorsSchema = z.object({
  background: z.string().min(1),
  card: z.string().min(1),
  foreground: z.string().min(1),
  primary: z.string().min(1),
  primaryForeground: z.string().min(1),
  muted: z.string().min(1),
  mutedForeground: z.string().min(1),
  accent: z.string().min(1),
  accentForeground: z.string().min(1),
  border: z.string().min(1),
  destructive: z.string().min(1),
  destructiveForeground: z.string().min(1),
});

export const themeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  colors: themeColorsSchema,
  isBuiltIn: z.boolean().optional(),
});

/** Nøgle til de cachede tema-farver i localStorage (læses af boot-scriptet). */
export const THEME_CACHE_KEY = "astonskoekken.theme";

/**
 * Sæt tema-farverne som CSS-variabler på <html>. Mappingen er identisk med
 * boot-scriptet i src/routes/__root.tsx — hold dem synkroniseret.
 */
export function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement;
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set("--background", colors.background);
  set("--foreground", colors.foreground);
  set("--card", colors.card);
  set("--card-foreground", colors.foreground);
  set("--popover", colors.card);
  set("--popover-foreground", colors.foreground);
  set("--primary", colors.primary);
  set("--primary-foreground", colors.primaryForeground);
  set("--secondary", colors.accent);
  set("--secondary-foreground", colors.accentForeground);
  set("--muted", colors.muted);
  set("--muted-foreground", colors.mutedForeground);
  set("--accent", colors.accent);
  set("--accent-foreground", colors.accentForeground);
  set("--destructive", colors.destructive);
  set("--destructive-foreground", colors.destructiveForeground);
  set("--border", colors.border);
  set("--input", colors.muted);
  set("--ring", colors.primary);
}
