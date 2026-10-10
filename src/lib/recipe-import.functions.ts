import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireMember } from "@/lib/auth-middleware";
import { IMAGE_BUCKET } from "@/lib/supabase";
import { parseIngredientLine, type ParsedIngredientLine } from "@/lib/ingredient-parser";

/**
 * Import af opskrift fra et link.
 *
 * De fleste madsider (Valdemarsro, Arla, Mummum, BBC Good Food …) har
 * opskriften indlejret som schema.org/Recipe i JSON-LD. Serveren henter siden
 * (det kan browseren ikke pga. CORS), finder opskriften og returnerer den i
 * appens format. Billedet kopieres til appens egen storage, så det ikke
 * forsvinder, hvis siden ændrer sig.
 */

export type ImportedRecipe = {
  title: string;
  description: string | null;
  servings: number | null;
  prepMinutes: number | null;
  imageUrl: string | null;
  sourceUrl: string;
  ingredients: ParsedIngredientLine[];
  steps: string[];
};

const MAX_HTML_BYTES = 3_000_000;
const MAX_IMAGE_BYTES = 6_000_000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export const importRecipeFromUrl = createServerFn({ method: "POST" })
  .middleware([requireMember])
  .inputValidator((d: { url: string }) => z.object({ url: z.string().url().max(2000) }).parse(d))
  .handler(async ({ data, context }): Promise<ImportedRecipe> => {
    const url = new URL(data.url);
    if (!/^https?:$/.test(url.protocol)) throw new Error("Linket skal starte med http(s)://");

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
        redirect: "follow",
      });
    } catch {
      throw new Error("Kunne ikke hente siden. Tjek linket.");
    }
    if (!res.ok) throw new Error(`Siden svarede med fejl ${res.status}.`);

    const html = (await res.text()).slice(0, MAX_HTML_BYTES);
    const recipe = findRecipeJsonLd(html);
    if (!recipe) {
      throw new Error(
        "Fandt ingen opskrift på siden. Siden understøtter ikke import — opret opskriften manuelt.",
      );
    }

    const title = clean(text(recipe.name)) || clean(metaContent(html, "og:title")) || "Ny opskrift";
    const description = clean(text(recipe.description)) || null;
    const ingredients = asArray(recipe.recipeIngredient ?? recipe.ingredients)
      .map((l) => clean(text(l)))
      .filter(Boolean)
      .map(parseIngredientLine);
    const steps = parseInstructions(recipe.recipeInstructions);
    const servings = parseYield(recipe.recipeYield);
    const prepMinutes =
      parseDuration(text(recipe.totalTime)) ??
      sumNullable(parseDuration(text(recipe.prepTime)), parseDuration(text(recipe.cookTime)));

    const remoteImage = imageUrl(recipe.image) ?? metaContent(html, "og:image");
    let storedImage: string | null = null;
    if (remoteImage) {
      storedImage = await copyImage(
        new URL(remoteImage, url).toString(),
        context.supabase,
      ).catch(() => null);
    }

    return {
      title,
      description,
      servings,
      prepMinutes,
      imageUrl: storedImage ?? (remoteImage ? new URL(remoteImage, url).toString() : null),
      sourceUrl: url.toString(),
      ingredients,
      steps,
    };
  });

// ─── JSON-LD ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

function findRecipeJsonLd(html: string): Json | null {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    let parsed: Json;
    try {
      parsed = JSON.parse(m[1].trim());
    } catch {
      try {
        // Nogle sider har kontroltegn/linjeskift inde i strenge
        parsed = JSON.parse(m[1].trim().replace(/[\u0000-\u001f]+/g, " "));
      } catch {
        continue;
      }
    }
    const found = searchRecipe(parsed, 0);
    if (found) return found;
  }
  return null;
}

function isRecipeType(t: Json): boolean {
  if (typeof t === "string") return t.toLowerCase() === "recipe" || t.endsWith("/Recipe");
  if (Array.isArray(t)) return t.some(isRecipeType);
  return false;
}

function searchRecipe(node: Json, depth: number): Json | null {
  if (!node || depth > 6) return null;
  if (Array.isArray(node)) {
    for (const n of node) {
      const f = searchRecipe(n, depth + 1);
      if (f) return f;
    }
    return null;
  }
  if (typeof node !== "object") return null;
  if (isRecipeType(node["@type"])) return node;
  for (const key of ["@graph", "mainEntity", "mainEntityOfPage", "itemListElement", "item"]) {
    if (node[key]) {
      const f = searchRecipe(node[key], depth + 1);
      if (f) return f;
    }
  }
  return null;
}

function asArray(v: Json): Json[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function text(v: Json): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(text).join(" ");
  if (typeof v === "object") return text(v.text ?? v.name ?? v["@value"] ?? "");
  return "";
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  aelig: "æ",
  AElig: "Æ",
  oslash: "ø",
  Oslash: "Ø",
  aring: "å",
  Aring: "Å",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  deg: "°",
  ndash: "–",
  mdash: "—",
  hellip: "…",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (all, name) => ENTITIES[name] ?? all);
}

function clean(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function parseInstructions(v: Json): string[] {
  const out: string[] = [];
  const walk = (n: Json) => {
    if (n == null) return;
    if (typeof n === "string") {
      // En samlet tekstblok: del på linjeskift eller nummerering
      const parts = decodeEntities(n.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n"))
        .replace(/<[^>]+>/g, " ")
        .split(/\n+|(?:^|\s)(?=\d+\.\s)/)
        .map((p) => p.replace(/^\s*\d+\.\s*/, "").replace(/\s+/g, " ").trim())
        .filter(Boolean);
      out.push(...parts);
      return;
    }
    if (Array.isArray(n)) {
      n.forEach(walk);
      return;
    }
    if (typeof n === "object") {
      if (n.itemListElement) {
        walk(n.itemListElement);
        return;
      }
      const t = clean(text(n.text ?? n.name ?? ""));
      if (t) out.push(t);
    }
  };
  walk(v);
  return out;
}

function parseYield(v: Json): number | null {
  for (const item of asArray(v)) {
    const m = text(item).match(/\d+/);
    if (m) {
      const n = Number(m[0]);
      if (n >= 1 && n <= 50) return n;
    }
  }
  return null;
}

/** ISO 8601-varighed (PT1H30M) → minutter */
function parseDuration(s: string): number | null {
  const m = s.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
  if (!m) return null;
  const min = Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return min > 0 ? min : null;
}

function sumNullable(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

function imageUrl(v: Json): string | null {
  for (const item of asArray(v)) {
    if (typeof item === "string" && item) return item;
    if (item && typeof item === "object") {
      const u = item.url ?? item.contentUrl ?? item["@id"];
      if (typeof u === "string" && u) return u;
    }
  }
  return null;
}

function metaContent(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1] ?? m[2]) : null;
}

// ─── Billede ────────────────────────────────────────────────────────────────

async function copyImage(
  src: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
): Promise<string | null> {
  const res = await fetch(src, { headers: { "user-agent": USER_AGENT } });
  if (!res.ok) return null;
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext =
    type === "image/png"
      ? "png"
      : type === "image/webp"
        ? "webp"
        : type === "image/jpeg" || type === "image/jpg"
          ? "jpg"
          : null;
  if (!ext) return null;
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_IMAGE_BYTES) return null;

  const path = `recipes/import-${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage
    .from(IMAGE_BUCKET)
    .upload(path, buf, { contentType: type, upsert: false });
  if (error) return null;
  return client.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl as string;
}
