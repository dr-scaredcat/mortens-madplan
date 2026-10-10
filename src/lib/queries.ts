import { useQuery } from "@tanstack/react-query";
import { supabase, unwrap } from "@/lib/supabase";
import { DEFAULT_THEMES, type Theme } from "@/lib/themes";
import { isFontKey, type FontKey } from "@/lib/fonts";
import {
  DEFAULT_PLANNER,
  type Ingredient,
  type MealLog,
  type MemberName,
  type PlanDay,
  type PlanDaySide,
  type PlannerSettings,
  type Rating,
  type Recipe,
  type RecipeDetail,
  type RecipeIngredient,
  type RecipeListItem,
  type RecipeStep,
  type ShopCategory,
  type ShoppingItem,
  type Tag,
  type TagGroup,
  type WeekTemplate,
} from "@/lib/types";

export const DEFAULT_APP_NAME = "Astons Køkken";

// ─── Indstillinger ──────────────────────────────────────────────────────────

export type AppSettings = {
  appName: string;
  themes: Theme[];
  activeThemeId: string;
  planner: PlannerSettings;
  weekTemplate: WeekTemplate;
  headingFont: FontKey;
  titleFont: FontKey;
  header: HeaderSettings;
  headingScale: HeadingScale;
};

/** Skalering af overskrifter i procent (Admin → Temaer). */
export type HeadingScale = { main: number; sub: number; small: number };
export const DEFAULT_HEADING_SCALE: HeadingScale = { main: 100, sub: 100, small: 100 };

function parseHeadingScale(v: unknown): HeadingScale {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const pct = (x: unknown, d: number) =>
    typeof x === "number" && x >= 50 && x <= 250 ? x : d;
  return { main: pct(o.main, 100), sub: pct(o.sub, 100), small: pct(o.small, 100) };
}

/** Logo og titel i toppen af siden (Admin → Generelt). */
export type HeaderSettings = {
  /** "custom" = public/custom-logo.png, "pot" = den indbyggede gryde */
  logoType: "custom" | "pot";
  logoSize: number;
  textSize: number;
  gap: number;
  logoOffsetY: number;
  textOffsetY: number;
};

export const DEFAULT_HEADER: HeaderSettings = {
  logoType: "custom",
  logoSize: 40,
  textSize: 24,
  gap: 10,
  logoOffsetY: 0,
  textOffsetY: 0,
};

function parseHeader(v: unknown): HeaderSettings {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const n = (k: keyof HeaderSettings) =>
    typeof o[k] === "number" && Number.isFinite(o[k]) ? (o[k] as number) : (DEFAULT_HEADER[k] as number);
  return {
    logoType: o.logoType === "pot" ? "pot" : "custom",
    logoSize: n("logoSize"),
    textSize: n("textSize"),
    gap: n("gap"),
    logoOffsetY: n("logoOffsetY"),
    textOffsetY: n("textOffsetY"),
  };
}

export async function fetchSettings(): Promise<AppSettings> {
  const rows = unwrap(await supabase.from("settings").select("key, value")) as {
    key: string;
    value: unknown;
  }[];
  const get = (k: string) => rows.find((r) => r.key === k)?.value;

  const themes = Array.isArray(get("themes")) ? (get("themes") as Theme[]) : DEFAULT_THEMES;
  const name = get("app_name");
  const active = get("active_theme");
  const planner = (get("planner") ?? {}) as Partial<PlannerSettings>;
  const template = (get("week_template") ?? {}) as WeekTemplate;

  return {
    appName: typeof name === "string" && name.trim() ? name : DEFAULT_APP_NAME,
    themes: themes.length ? themes : DEFAULT_THEMES,
    activeThemeId: typeof active === "string" ? active : "built-in-light",
    planner: { ...DEFAULT_PLANNER, ...planner },
    weekTemplate: template,
    headingFont: isFontKey(get("heading_font")) ? (get("heading_font") as FontKey) : "default",
    titleFont: isFontKey(get("title_font")) ? (get("title_font") as FontKey) : "default",
    header: parseHeader(get("header")),
    headingScale: parseHeadingScale(get("heading_scale")),
  };
}

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: fetchSettings, staleTime: 5 * 60_000 });
}

export async function saveSetting(key: string, value: unknown) {
  unwrap(await supabase.from("settings").upsert({ key, value }));
}

// ─── Mig selv / medlemskab ──────────────────────────────────────────────────

export type Me = { userId: string; email: string | null; isMember: boolean; isAdmin: boolean };

export async function fetchMe(): Promise<Me | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const row = unwrap(
    await supabase.from("members").select("is_admin").eq("user_id", user.id).maybeSingle(),
  ) as { is_admin: boolean } | null;
  return {
    userId: user.id,
    email: user.email ?? null,
    isMember: !!row,
    isAdmin: !!row?.is_admin,
  };
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 5 * 60_000 });
}

export function useMemberNames() {
  return useQuery({
    queryKey: ["member-names"],
    queryFn: async () => unwrap(await supabase.rpc("member_names")) as MemberName[],
    staleTime: 10 * 60_000,
  });
}

// ─── Katalog: kategorier, ingredienser, tags ────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      unwrap(
        await supabase.from("shop_categories").select("*").order("sort_order").order("name"),
      ) as ShopCategory[],
  });
}

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () =>
      unwrap(await supabase.from("ingredients").select("*").order("name")) as Ingredient[],
  });
}

export function useTagGroups() {
  return useQuery({
    queryKey: ["tag-groups"],
    queryFn: async () =>
      unwrap(
        await supabase.from("tag_groups").select("*").order("sort_order").order("name"),
      ) as TagGroup[],
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () =>
      unwrap(await supabase.from("tags").select("*").order("sort_order").order("name")) as Tag[],
  });
}

// ─── Opskrifter ─────────────────────────────────────────────────────────────

const RECENT_RATINGS = DEFAULT_PLANNER.recentRatings;

function summarize(ratings: Pick<Rating, "score" | "created_at">[]) {
  if (!ratings.length) return { avg: null, recent: null };
  const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
  const recent = [...ratings]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, RECENT_RATINGS);
  return { avg, recent: recent.reduce((s, r) => s + r.score, 0) / recent.length };
}

type RecipeListRow = Recipe & {
  recipe_tags: { tag_id: string }[];
  ratings: { score: number; created_at: string }[];
  meal_log: { eaten_on: string }[];
  recipe_ingredients: { ingredient_id: string }[];
};

export async function fetchRecipeList(): Promise<RecipeListItem[]> {
  const rows = unwrap(
    await supabase
      .from("recipes")
      .select(
        "*, recipe_tags(tag_id), ratings(score, created_at), meal_log(eaten_on), recipe_ingredients(ingredient_id)",
      )
      .eq("archived", false)
      .order("title"),
  ) as RecipeListRow[];

  return rows.map(({ recipe_tags, ratings, meal_log, recipe_ingredients, ...r }) => {
    const { avg, recent } = summarize(ratings);
    const eaten = meal_log.map((m) => m.eaten_on).sort();
    return {
      ...r,
      tag_ids: recipe_tags.map((t) => t.tag_id),
      avg_score: avg,
      recent_score: recent,
      rating_count: ratings.length,
      last_eaten: eaten.length ? eaten[eaten.length - 1] : null,
      times_eaten: eaten.length,
      ingredient_ids: recipe_ingredients.map((i) => i.ingredient_id),
    };
  });
}

export function useRecipes() {
  return useQuery({ queryKey: ["recipes"], queryFn: fetchRecipeList });
}

type RecipeDetailRow = Recipe & {
  recipe_ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
  recipe_steps: RecipeStep[];
  recipe_tags: { tag_id: string }[];
  ratings: Rating[];
  meal_log: MealLog[];
};

export async function fetchRecipe(id: string): Promise<RecipeDetail | null> {
  const row = unwrap(
    await supabase
      .from("recipes")
      .select(
        "*, recipe_ingredients(*, ingredient:ingredients(*)), recipe_steps(*), recipe_tags(tag_id), ratings(*), meal_log(*)",
      )
      .eq("id", id)
      .maybeSingle(),
  ) as RecipeDetailRow | null;
  if (!row) return null;
  const { recipe_ingredients, recipe_steps, recipe_tags, ratings, meal_log, ...r } = row;
  return {
    ...r,
    ingredients: [...recipe_ingredients].sort((a, b) => a.sort_order - b.sort_order),
    steps: [...recipe_steps].sort((a, b) => a.sort_order - b.sort_order),
    tag_ids: recipe_tags.map((t) => t.tag_id),
    ratings: [...ratings].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    meals: [...meal_log].sort((a, b) => b.eaten_on.localeCompare(a.eaten_on)),
  };
}

export function useRecipe(id: string) {
  return useQuery({ queryKey: ["recipe", id], queryFn: () => fetchRecipe(id) });
}

// ─── Indkøbsliste ───────────────────────────────────────────────────────────

export function useShoppingItems() {
  return useQuery({
    queryKey: ["shopping"],
    queryFn: async () =>
      unwrap(
        await supabase.from("shopping_items").select("*").order("created_at"),
      ) as ShoppingItem[],
    staleTime: 10_000,
  });
}

// ─── Ugeplan ────────────────────────────────────────────────────────────────

export function usePlanDays(from: string, to: string) {
  return useQuery({
    queryKey: ["plan-days", from, to],
    queryFn: async () =>
      unwrap(
        await supabase
          .from("plan_days")
          .select("*")
          .gte("day", from)
          .lte("day", to)
          .order("day"),
      ) as PlanDay[],
  });
}

export function usePlanSides(from: string, to: string) {
  return useQuery({
    queryKey: ["plan-sides", from, to],
    queryFn: async () => {
      const res = await supabase
        .from("plan_day_sides")
        .select("day, recipe_id, sort_order")
        .gte("day", from)
        .lte("day", to)
        .order("sort_order");
      // Tabellen findes først efter migrationen om tilbehør — indtil da: ingen tilbehør
      if (res.error) return [] as PlanDaySide[];
      return (res.data ?? []) as PlanDaySide[];
    },
  });
}

// ─── "Hvordan var retten?" ──────────────────────────────────────────────────

export type RatingPrompt = { meal: MealLog; recipe: Pick<Recipe, "id" | "title" | "image_url"> };

/**
 * Måltider fra de seneste 7 dage, som jeg ikke har vurderet eller sprunget
 * over. Ældste først.
 */
export async function fetchRatingPrompts(userId: string): Promise<RatingPrompt[]> {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const sinceISO = since.toISOString().slice(0, 10);

  const meals = unwrap(
    await supabase
      .from("meal_log")
      .select("*, recipe:recipes(id, title, image_url), ratings(user_id), rating_prompt_dismissals(user_id)")
      .gte("eaten_on", sinceISO)
      .order("eaten_on"),
  ) as (MealLog & {
    recipe: Pick<Recipe, "id" | "title" | "image_url"> | null;
    ratings: { user_id: string }[];
    rating_prompt_dismissals: { user_id: string }[];
  })[];

  return meals
    .filter(
      (m) =>
        m.recipe &&
        !m.ratings.some((r) => r.user_id === userId) &&
        !m.rating_prompt_dismissals.some((d) => d.user_id === userId),
    )
    .map(({ ratings: _r, rating_prompt_dismissals: _d, recipe, ...meal }) => ({
      meal,
      recipe: recipe!,
    }));
}
