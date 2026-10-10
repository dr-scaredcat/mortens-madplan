// Fortolkning af en opskrift skrevet som fritekst — fx genereret af en AI
// eller kopieret fra en mail. Teksten deles op i titel, beskrivelse,
// ingredienser og fremgangsmåde ud fra overskrifter og lister.
//
// Underoverskrifter (fx "### Sauce", "**Til saucen:**") bevares som linjer
// der ender med ":", så formularen laver dem om til afsnit.

import { parseIngredientLine, type ParsedIngredientLine } from "@/lib/ingredient-parser";

export type ParsedTextRecipe = {
  title: string;
  description: string | null;
  servings: number | null;
  prepMinutes: number | null;
  ingredients: ParsedIngredientLine[];
  steps: string[];
};

type Mode = "intro" | "ingredients" | "steps" | "notes";

const INGREDIENT_HEADINGS =
  /^(ingrediens(er)?|ingredients?|du skal bruge|det skal du bruge|indkøb(sliste)?|råvarer)\b/i;
const STEP_HEADINGS =
  /^(fremgangsmåde|sådan gør du|tilberedning|instruktion(er)?|metode|vejledning|opskrift|instructions?|method|directions?|trin)\b/i;
const NOTE_HEADINGS =
  /^(tips?|noter?|bemærk(ninger)?|servering(sforslag)?|variationer?|opbevaring|god appetit)\b/i;
const META_LINE =
  /^(antal|portioner|personer|serveringer|tid|tilberedningstid|arbejdstid|samlet tid|forberedelse|forberedelsestid|tilberedning|sværhedsgrad|kalorier|(til|for) \d+(\s*-\s*\d+)? (personer|pers|portioner))\b/i;

/** Fjern markdown-formatering fra en linje. */
function stripMd(s: string): string {
  return s
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/(^|\s)[*_](\S.*?\S|\S)[*_](?=\s|$|[.,:;!?])/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/** Er linjen en overskrift? Returnér teksten uden markdown og kolon, ellers null. */
function headingOf(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^#{1,6}\s+\S/.test(t)) return stripMd(t).replace(/:$/, "").trim();
  // Hel linje i fed: **Sauce** eller **Sauce:**
  const bold = t.match(/^\*\*([^*]+?)\*\*:?$/) ?? t.match(/^__([^_]+?)__:?$/);
  if (bold) return bold[1].replace(/:$/, "").trim();
  // Kort linje der ender med kolon og ikke er en listepunkt: "Ingredienser:", "Til saucen:"
  if (/^[^\-*•\d].{0,48}:$/.test(t) && !/\d+\s*(g|kg|dl|ml|l|spsk|tsk)\b/i.test(t)) {
    return stripMd(t.slice(0, -1)).trim();
  }
  return null;
}

const LIST_ITEM = /^\s*(?:[-*•–·]|\d+[.)]|\(\d+\)|[a-z][.)])\s+/i;

function isListItem(line: string): boolean {
  return LIST_ITEM.test(line);
}

function listText(line: string): string {
  return stripMd(line.replace(LIST_ITEM, ""));
}

/** Ligner linjen en ingrediens (starter med mængde, eller er kort)? */
function looksLikeIngredient(text: string): boolean {
  if (/^(\d|[¼½¾⅓⅔]|ca\.?\s*\d)/i.test(text)) return true;
  return text.length <= 40 && !/[.!?]$/.test(text);
}

function findServings(text: string): number | null {
  const m =
    text.match(/(\d+)\s*(?:-\s*\d+\s*)?(?:personer|pers\.?|portioner|servinger|serveringer|servings|people)\b/i) ??
    text.match(/(?:til|for|antal personer:?|portioner:?|serveringer:?|serves:?)\s*(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 50 ? n : null;
}

function findMinutes(text: string): number | null {
  // Foretræk en linje om samlet tid; ellers første linje om tid
  const lines = text.split("\n").filter((l) => /tid|time|minut|min\b/i.test(l));
  const preferred =
    lines.find((l) => /samlet|i alt|total/i.test(l)) ?? lines.find((l) => META_LINE.test(stripMd(l)));
  if (!preferred) return null;
  const h = preferred.match(/(\d+(?:[.,]\d+)?)\s*(?:timer|time|t\b|h\b)/i);
  const m = preferred.match(/(\d+)\s*(?:minutter|minut|min)\b/i);
  const total = (h ? Math.round(Number(h[1].replace(",", ".")) * 60) : 0) + (m ? Number(m[1]) : 0);
  return total > 0 ? total : null;
}

export function parseTextRecipe(input: string): ParsedTextRecipe {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");

  let title = "";
  const intro: string[] = [];
  const notes: string[] = [];
  const ingredientLines: string[] = [];
  const steps: string[] = [];
  let mode: Mode = "intro";
  let sawSectionHeading = false;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    paragraph = [];
    if (!text) return;
    if (mode === "steps") steps.push(text);
    else if (mode === "notes") notes.push(text);
    else if (mode === "intro") intro.push(text);
    else ingredientLines.push(text);
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushParagraph();
      continue;
    }

    // Titlen: første ikke-tomme linje
    if (!title) {
      title = stripMd(line).replace(/^opskrift(?:\s+på)?:?\s*/i, "").replace(/:$/, "");
      continue;
    }

    const heading = headingOf(line);
    if (heading) {
      flushParagraph();
      if (INGREDIENT_HEADINGS.test(heading)) {
        mode = "ingredients";
        sawSectionHeading = true;
        continue;
      }
      if (STEP_HEADINGS.test(heading)) {
        mode = "steps";
        sawSectionHeading = true;
        continue;
      }
      if (NOTE_HEADINGS.test(heading)) {
        mode = "notes";
        continue;
      }
      if (META_LINE.test(heading)) continue;
      // Underoverskrift i ingredienser eller trin → afsnit
      if (mode === "ingredients") ingredientLines.push(`${heading}:`);
      else if (mode === "steps") steps.push(`${heading}:`);
      else if (mode === "notes") notes.push(heading);
      continue;
    }

    // Metadata-linjer som "Antal: 4 personer" eller "Tid: 45 min" springes over
    if (META_LINE.test(stripMd(line).replace(/^[-*•]\s*/, "")) && line.length < 80) {
      flushParagraph();
      continue;
    }

    if (isListItem(line)) {
      flushParagraph();
      const text = listText(line);
      if (mode === "ingredients") ingredientLines.push(text);
      else if (mode === "steps") steps.push(text);
      else if (mode === "notes") notes.push(text);
      else if (!sawSectionHeading) {
        // Ingen overskrifter endnu: korte punkter er ingredienser, lange er trin
        if (/^\d+[.)]/.test(line.trim()) && !looksLikeIngredient(text)) {
          mode = "steps";
          steps.push(text);
        } else if (looksLikeIngredient(text)) {
          mode = "ingredients";
          ingredientLines.push(text);
        } else {
          intro.push(text);
        }
      }
      continue;
    }

    // Almindelig tekst
    const plain = stripMd(line);

    // Uden overskrifter: en linje der starter med en mængde starter ingredienslisten
    if (mode === "intro" && !sawSectionHeading && /^(\d|[¼½¾⅓⅔]|ca\.?\s*\d)/i.test(plain)) {
      flushParagraph();
      mode = "ingredients";
      ingredientLines.push(plain);
      continue;
    }

    // I fremgangsmåden er hver linje ét trin
    if (mode === "steps") {
      flushParagraph();
      steps.push(plain);
      continue;
    }

    if (mode === "ingredients") {
      const text = stripMd(line);
      if (looksLikeIngredient(text)) {
        ingredientLines.push(text);
      } else {
        // Lang tekst efter ingredienserne uden overskrift: så er vi nået til trinnene
        mode = "steps";
        steps.push(text);
      }
      continue;
    }
    paragraph.push(stripMd(line));
  }
  flushParagraph();

  const allText = input;
  const description =
    [...intro.filter((l) => !META_LINE.test(l)), ...notes.map((n) => n)].join("\n\n").trim() || null;

  return {
    title: title || "Ny opskrift",
    description,
    servings: findServings(allText),
    prepMinutes: findMinutes(allText),
    ingredients: ingredientLines.map((l) => parseIngredientLine(l)),
    steps: steps.map((s) => s.trim()).filter(Boolean),
  };
}
