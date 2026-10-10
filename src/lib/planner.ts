// Ugeplanens forslagsalgoritme.
//
// Hver opskrift får en vægt, og der trækkes tilfældigt efter vægten — så de
// bedste og længst-glemte retter oftest kommer med, men ugen alligevel varierer.
//
//   vægt = score × tid-siden-sidst × weekend × variation
//
//   score:     2^(score − 3)  → 5★ = 4, 4★ = 2, 3★ = 1, 2★ = ½, 1★ = ¼.
//              Opskrifter uden vurdering får 3,5★, så nye retter også prøves.
//   tid:       vokser med dagene siden retten sidst blev spist (loft ved 120
//              dage). Retter spist inden for "excludeDays" springes over.
//   weekend:   fredag/lørdag ganges weekendmad med weekendFactor; på andre
//              dage divideres med den. Ikke-weekendretter fredag/lørdag
//              divideres også med den — de kan altså komme med, bare sjældnere.
//   variation: samme hovedingrediens som dagen før/efter giver ×0,1; er
//              hovedingrediensen allerede brugt maxMainPerWeek gange, ×0,05.

import { daysBetween, parseISODate } from "@/lib/format";
import type { PlannerSettings, RecipeListItem, Tag, TagGroup } from "@/lib/types";

export const NEVER_EATEN_DAYS = 60;

export type PlannerContext = {
  recipes: RecipeListItem[];
  tags: Tag[];
  groups: TagGroup[];
  settings: PlannerSettings;
  /**
   * Alle kendte planlagte retter (dato → opskrift) i og omkring ugen, så
   * algoritmen undgår dubletter og ved hvad der står dagen før/efter.
   */
  planned: Map<string, string>;
};

type Prepared = {
  weekendIds: Set<string>;
  mainOf: Map<string, string[]>;
};

function prepare(ctx: PlannerContext): Prepared {
  const mainGroupIds = new Set(ctx.groups.filter((g) => g.is_main_ingredient).map((g) => g.id));
  const mainTagIds = new Set(
    ctx.tags.filter((t) => t.group_id && mainGroupIds.has(t.group_id)).map((t) => t.id),
  );
  const weekendTagIds = new Set(ctx.tags.filter((t) => t.is_weekend).map((t) => t.id));
  const weekendIds = new Set<string>();
  const mainOf = new Map<string, string[]>();
  for (const r of ctx.recipes) {
    if (r.tag_ids.some((t) => weekendTagIds.has(t))) weekendIds.add(r.id);
    mainOf.set(
      r.id,
      r.tag_ids.filter((t) => mainTagIds.has(t)),
    );
  }
  return { weekendIds, mainOf };
}

function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO-ugedag: 1 = mandag … 7 = søndag */
export function isoWeekday(iso: string): number {
  const wd = parseISODate(iso).getDay();
  return wd === 0 ? 7 : wd;
}

export function isWeekendDay(iso: string): boolean {
  const wd = isoWeekday(iso);
  return wd === 5 || wd === 6;
}

/** Dage siden retten sidst blev spist eller er planlagt, set fra `day`. */
function daysSince(recipe: RecipeListItem, day: string, ctx: PlannerContext): number {
  let best = Infinity;
  if (recipe.last_eaten) best = Math.abs(daysBetween(recipe.last_eaten, day));
  for (const [d, rid] of ctx.planned) {
    if (rid === recipe.id && d !== day) best = Math.min(best, Math.abs(daysBetween(d, day)));
  }
  return best === Infinity ? NEVER_EATEN_DAYS : best;
}

export type Scored = { recipe: RecipeListItem; weight: number; excluded: boolean };

/** Beregn vægten af alle opskrifter for én dag. */
export function scoreForDay(day: string, ctx: PlannerContext, prep = prepare(ctx)): Scored[] {
  const s = ctx.settings;
  const weekend = isWeekendDay(day);
  const factor = Math.max(1, s.weekendFactor);

  // Hovedingredienser dagen før/efter og brugt i ugen
  const neighbours = [addDays(day, -1), addDays(day, 1)]
    .map((d) => ctx.planned.get(d))
    .filter((x): x is string => !!x);
  const neighbourMains = new Set(neighbours.flatMap((rid) => prep.mainOf.get(rid) ?? []));

  const weekStart = addDays(day, -(isoWeekday(day) - 1));
  const mainCount = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i);
    if (d === day) continue;
    const rid = ctx.planned.get(d);
    if (!rid) continue;
    for (const m of prep.mainOf.get(rid) ?? []) mainCount.set(m, (mainCount.get(m) ?? 0) + 1);
  }

  return ctx.recipes.map((recipe) => {
    const since = daysSince(recipe, day, ctx);
    const excluded = since < Math.max(1, s.excludeDays);

    const score = recipe.recent_score ?? 3.5;
    let w = Math.pow(2, score - 3);
    w *= 0.4 + Math.min(since, 120) / 30;

    const isWeekendRecipe = prep.weekendIds.has(recipe.id);
    if (weekend) w *= isWeekendRecipe ? factor : 1 / factor;
    else if (isWeekendRecipe) w /= factor;

    const mains = prep.mainOf.get(recipe.id) ?? [];
    if (mains.some((m) => neighbourMains.has(m))) w *= 0.1;
    if (mains.some((m) => (mainCount.get(m) ?? 0) >= s.maxMainPerWeek)) w *= 0.05;

    return { recipe, weight: w, excluded };
  });
}

function weightedPick<T extends { weight: number }>(items: T[], rnd = Math.random): T | null {
  const total = items.reduce((s, i) => s + i.weight, 0);
  if (total <= 0) return items[0] ?? null;
  let r = rnd() * total;
  for (const i of items) {
    r -= i.weight;
    if (r <= 0) return i;
  }
  return items[items.length - 1] ?? null;
}

/**
 * Foreslå en ret til én dag. `avoid` er opskrifter der ikke må vælges
 * (fx den nuværende ret ved "Giv nyt forslag").
 */
export function suggestForDay(
  day: string,
  ctx: PlannerContext,
  avoid: Set<string> = new Set(),
): RecipeListItem | null {
  const prep = prepare(ctx);
  const all = scoreForDay(day, ctx, prep);
  const allowed = all.filter((s) => !avoid.has(s.recipe.id));
  // Er der så få opskrifter, at alle er udelukket, må dubletter komme med
  const scored = allowed.length ? allowed : all;
  // Først uden de nyligt spiste; har vi for få retter, så slækkes kravet.
  const fresh = scored.filter((s) => !s.excluded);
  const pool = fresh.length ? fresh : scored;
  return weightedPick(pool)?.recipe ?? null;
}

/**
 * Lav forslag til flere dage i rækkefølge. Hvert valg tages med i
 * konteksten, så samme ret ikke foreslås to gange, og variationen virker.
 */
export function suggestDays(days: string[], ctx: PlannerContext): Map<string, string> {
  const planned = new Map(ctx.planned);
  for (const d of days) planned.delete(d);
  const result = new Map<string, string>();
  for (const d of [...days].sort()) {
    const usedThisWeek = new Set(planned.values());
    const pick = suggestForDay(d, { ...ctx, planned }, usedThisWeek);
    if (pick) {
      planned.set(d, pick.id);
      result.set(d, pick.id);
    }
  }
  return result;
}

export { addDays };
