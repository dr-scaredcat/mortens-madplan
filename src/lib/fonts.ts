// Valgbare skrifttyper til sidens titel og overskrifter (Admin → Temaer).

export type FontKey = "default" | "permanent-marker" | "bebas-neue";

export const FONT_OPTIONS: {
  key: FontKey;
  label: string;
  /** Google Fonts-familie (css2-format), eller null for tema-standarden */
  google: string | null;
  stack: string;
}[] = [
  {
    key: "default",
    label: "Tema-standard",
    google: null,
    stack: '"Fraunces", ui-serif, Georgia, serif',
  },
  {
    key: "permanent-marker",
    label: "Permanent Marker",
    google: "Permanent+Marker",
    stack: '"Permanent Marker", "Fraunces", cursive',
  },
  {
    key: "bebas-neue",
    label: "Bebas Neue",
    google: "Bebas+Neue",
    stack: '"Bebas Neue", "Fraunces", sans-serif',
  },
];

export const FONT_CACHE_KEY = "astonskoekken.fonts";

export function fontStack(key: string | null | undefined): string {
  return (FONT_OPTIONS.find((f) => f.key === key) ?? FONT_OPTIONS[0]).stack;
}

export function isFontKey(v: unknown): v is FontKey {
  return typeof v === "string" && FONT_OPTIONS.some((f) => f.key === v);
}

/** Google Fonts-URL for netop de valgte skrifttyper, eller null hvis ingen. */
export function fontHref(keys: (string | null | undefined)[]): string | null {
  const families = [
    ...new Set(
      keys
        .map((k) => FONT_OPTIONS.find((f) => f.key === k)?.google)
        .filter((g): g is string => !!g),
    ),
  ];
  if (!families.length) return null;
  return `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
}

/**
 * Anvend skrifttyperne: indlæs dem fra Google Fonts og sæt CSS-variablerne
 * --font-heading (overskrifter) og --font-title (titlen i toppen).
 * Logikken er spejlet i boot-scriptet i src/routes/__root.tsx.
 */
export function applyFonts(heading: string, title: string) {
  const root = document.documentElement;
  root.style.setProperty("--font-heading", fontStack(heading));
  root.style.setProperty("--font-title", fontStack(title));

  const href = fontHref([heading, title]);
  let link = document.getElementById("app-fonts") as HTMLLinkElement | null;
  if (!href) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.id = "app-fonts";
    link.rel = "stylesheet";
    document.head.append(link);
  }
  if (link.getAttribute("href") !== href) link.setAttribute("href", href);
}
