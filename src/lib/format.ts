// Formatering af mængder, enheder og datoer på dansk.

export const UNITS = [
  "stk",
  "g",
  "kg",
  "ml",
  "dl",
  "l",
  "tsk",
  "spsk",
  "knsp",
  "fed",
  "dåse",
  "glas",
  "pakke",
  "pose",
  "bundt",
  "potte",
  "skive",
  "stilk",
  "terning",
  "håndfuld",
] as const;

const FRACTIONS: [number, string][] = [
  [0.25, "¼"],
  [0.5, "½"],
  [0.75, "¾"],
];

/**
 * Formatér en (evt. skaleret) mængde pænt:
 *  - store tal afrundes (ingen "512,5 g"),
 *  - små tal vises med ¼, ½ og ¾.
 */
export function formatAmount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "";
  if (n <= 0) return "0";
  if (n >= 50) return String(Math.round(n / 5) * 5);
  if (n >= 10) return String(Math.round(n));

  const rounded = Math.round(n * 4) / 4;
  if (rounded === 0) {
    // Meget små mængder: vis med én decimal
    return String(Math.round(n * 10) / 10).replace(".", ",");
  }
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  const sym = FRACTIONS.find(([v]) => Math.abs(v - frac) < 0.001)?.[1] ?? "";
  if (!sym) return String(whole);
  return whole === 0 ? sym : `${whole}${sym}`;
}

export function formatQuantity(amount: number | null | undefined, unit: string | null | undefined) {
  const a = formatAmount(amount ?? null);
  const u = unit?.trim() ?? "";
  return [a, u].filter(Boolean).join(" ");
}

/** Skalér en mængde fra opskriftens antal personer til det ønskede antal. */
export function scaleAmount(amount: number | null, from: number, to: number): number | null {
  if (amount == null) return null;
  if (!from || from <= 0) return amount;
  return (amount * to) / from;
}

/** Fortolk brugerinput som "1,5", "1½", "1/2", "1 1/2" til et tal. */
export function parseAmount(input: string): number | null {
  let s = input.trim().replace(",", ".");
  if (!s) return null;
  const uni: Record<string, number> = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 };
  let extra = 0;
  for (const [sym, val] of Object.entries(uni)) {
    if (s.includes(sym)) {
      extra += val;
      s = s.replace(sym, "").trim();
    }
  }
  if (!s) return extra || null;
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]) + extra;
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]) + extra;
  const n = Number(s);
  return Number.isFinite(n) ? n + extra : null;
}

/** Tal til redigeringsfelter: 1.5 → "1,5" */
export function amountToInput(n: number | null | undefined): string {
  if (n == null) return "";
  return String(Math.round(n * 1000) / 1000).replace(".", ",");
}

// ─── Datoer ─────────────────────────────────────────────────────────────────

/** Dagens dato i dansk tid som YYYY-MM-DD. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = parseISODate(fromISO).getTime();
  const b = parseISODate(toISO).getTime();
  return Math.round((b - a) / 86_400_000);
}

const MONTHS = [
  "jan.",
  "feb.",
  "mar.",
  "apr.",
  "maj",
  "jun.",
  "jul.",
  "aug.",
  "sep.",
  "okt.",
  "nov.",
  "dec.",
];
export const WEEKDAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

/** "3. okt." eller "3. okt. 2025" hvis et andet år */
export function formatDate(iso: string): string {
  const d = parseISODate(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return `${d.getDate()}. ${MONTHS[d.getMonth()]}${sameYear ? "" : ` ${d.getFullYear()}`}`;
}

/** "i dag", "i går", "for 5 dage siden", "for 3 uger siden" … */
export function formatAgo(iso: string | null): string {
  if (!iso) return "aldrig";
  const days = daysBetween(iso, todayISO());
  if (days < 0) return formatDate(iso);
  if (days === 0) return "i dag";
  if (days === 1) return "i går";
  if (days < 14) return `for ${days} dage siden`;
  if (days < 60) return `for ${Math.round(days / 7)} uger siden`;
  if (days < 365) return `for ${Math.round(days / 30)} måneder siden`;
  const years = Math.round(days / 365);
  return `for ${years} år siden`;
}

export function formatMinutes(min: number | null | undefined): string {
  if (!min) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} t ${m} min` : `${h} t`;
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return "";
  return score.toFixed(1).replace(".", ",");
}
