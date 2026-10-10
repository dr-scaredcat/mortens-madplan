// Fortolkning af ingredienslinjer som "2 spsk olivenolie" eller
// "500 g hakket oksekød, gerne 8-12 %" til mængde, enhed og navn — og
// matchning af navnet mod appens ingredienskatalog.

import type { Ingredient } from "@/lib/types";

export type ParsedIngredientLine = {
  raw: string;
  amount: number | null;
  unit: string | null;
  name: string;
  note: string | null;
};

// Synonymer → appens enheder. Længste først, så "spiseskefulde" vinder over "spsk".
const UNIT_SYNONYMS: [string, string][] = [
  ["spiseskefulde", "spsk"],
  ["spiseskefuld", "spsk"],
  ["teskefulde", "tsk"],
  ["teskefuld", "tsk"],
  ["knivspidser", "knsp"],
  ["knivspids", "knsp"],
  ["kilogram", "kg"],
  ["deciliter", "dl"],
  ["milliliter", "ml"],
  ["håndfulde", "håndfuld"],
  ["håndfuld", "håndfuld"],
  ["terninger", "terning"],
  ["terning", "terning"],
  ["stykker", "stk"],
  ["stykke", "stk"],
  ["skiver", "skive"],
  ["skive", "skive"],
  ["stilke", "stilk"],
  ["stilk", "stilk"],
  ["pakker", "pakke"],
  ["pakke", "pakke"],
  ["bundter", "bundt"],
  ["bundt", "bundt"],
  ["potter", "potte"],
  ["potte", "potte"],
  ["dåser", "dåse"],
  ["dåse", "dåse"],
  ["poser", "pose"],
  ["pose", "pose"],
  ["glas", "glas"],
  ["liter", "l"],
  ["gram", "g"],
  ["spsk.", "spsk"],
  ["spsk", "spsk"],
  ["tsk.", "tsk"],
  ["tsk", "tsk"],
  ["knsp.", "knsp"],
  ["knsp", "knsp"],
  ["stk.", "stk"],
  ["stk", "stk"],
  ["fed", "fed"],
  ["kg", "kg"],
  ["dl", "dl"],
  ["cl", "cl"],
  ["ml", "ml"],
  ["gr.", "g"],
  ["gr", "g"],
  ["g", "g"],
  ["l", "l"],
];

const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
};

function parseNumberToken(tok: string): number | null {
  let t = tok.replace(",", ".");
  let extra = 0;
  for (const [sym, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (t.includes(sym)) {
      extra += val;
      t = t.replace(sym, "");
    }
  }
  if (!t) return extra || null;
  const frac = t.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]) + extra;
  const n = Number(t);
  return Number.isFinite(n) ? n + extra : null;
}

const NUM = String.raw`(?:\d+(?:[.,]\d+)?[¼½¾⅓⅔⅛]?|\d+\/\d+|[¼½¾⅓⅔⅛])`;
const AMOUNT_RE = new RegExp(
  String.raw`^(${NUM})(?:\s+(\d+\/\d+))?(?:\s*(?:-|–|til)\s*(${NUM}))?\s*`,
  "i",
);

/** Fortolk én ingredienslinje. */
export function parseIngredientLine(raw: string): ParsedIngredientLine {
  let s = raw
    .replace(/\s+/g, " ")
    .replace(/^[-•*·]\s*/, "")
    .trim();

  let amount: number | null = null;
  const m = s.match(AMOUNT_RE);
  if (m) {
    const first = parseNumberToken(m[1]);
    const mixed = m[2] ? parseNumberToken(m[2]) : 0;
    const upper = m[3] ? parseNumberToken(m[3]) : null;
    // Interval ("2-3 fed") → brug den øvre værdi, så der købes nok ind
    amount = upper ?? (first != null ? first + (mixed ?? 0) : null);
    s = s.slice(m[0].length);
  }

  let unit: string | null = null;
  const lower = s.toLowerCase();
  for (const [syn, u] of UNIT_SYNONYMS) {
    if (lower.startsWith(syn) && (lower.length === syn.length || /[\s.,]/.test(lower[syn.length]))) {
      unit = u;
      s = s.slice(syn.length).replace(/^\.?\s*/, "");
      break;
    }
  }
  // "cl" findes ikke i appens enheder → omregn til ml
  if (unit === "cl" && amount != null) {
    amount = amount * 10;
    unit = "ml";
  } else if (unit === "cl") {
    unit = "ml";
  }

  // Note: tekst efter komma eller i parentes
  let note: string | null = null;
  const paren = s.match(/\(([^)]*)\)/);
  if (paren) {
    note = paren[1].trim() || null;
    s = s.replace(paren[0], " ").replace(/\s+/g, " ").trim();
  }
  const comma = s.indexOf(",");
  if (comma > 0) {
    const after = s.slice(comma + 1).trim();
    note = [after, note].filter(Boolean).join(", ") || null;
    s = s.slice(0, comma).trim();
  }

  return { raw, amount, unit, name: s.trim(), note };
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Simple danske bøjninger, så "løget", "tomaterne", "kartoflerne" også matcher
function stems(word: string): string[] {
  const out = new Set([word]);
  for (const suf of ["erne", "ene", "ne", "er", "et", "en", "e", "r"]) {
    if (word.length > suf.length + 2 && word.endsWith(suf)) out.add(word.slice(0, -suf.length));
  }
  return [...out];
}

/**
 * Find den ingrediens i kataloget, der bedst matcher et navn.
 * 1) præcist navn, 2) bøjningsform, 3) længste katalognavn indeholdt i teksten.
 */
export function matchIngredient(name: string, catalog: Ingredient[]): Ingredient | null {
  const n = normalize(name);
  if (!n) return null;

  const exact = catalog.find((c) => normalize(c.name) === n);
  if (exact) return exact;

  const nStems = stems(n);
  const stemHit = catalog.find((c) => {
    const cn = normalize(c.name);
    return nStems.some((s) => stems(cn).includes(s));
  });
  if (stemHit) return stemHit;

  let best: Ingredient | null = null;
  let bestLen = 0;
  for (const c of catalog) {
    const cn = normalize(c.name);
    if (cn.length < 3) continue;
    const re = new RegExp(`(^|[^a-zæøå])${cn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i");
    if (re.test(n) && cn.length > bestLen) {
      best = c;
      bestLen = cn.length;
    }
  }
  return best;
}
