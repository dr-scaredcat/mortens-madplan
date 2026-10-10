// Håndskrevne typer for tabellerne i schema "madplan".
// Se supabase/migrations/*_madplan_init.sql for den autoritative definition.

export type ShopCategory = {
  id: string;
  name: string;
  sort_order: number;
};

export type Ingredient = {
  id: string;
  name: string;
  category_id: string | null;
  default_unit: string | null;
  is_staple: boolean;
  in_stock: boolean;
};

export type TagGroup = {
  id: string;
  name: string;
  sort_order: number;
  is_main_ingredient: boolean;
};

export type Tag = {
  id: string;
  name: string;
  group_id: string | null;
  sort_order: number;
  is_weekend: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  description: string | null;
  servings: number;
  prep_minutes: number | null;
  image_url: string | null;
  source_url: string | null;
  archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  amount: number | null;
  unit: string | null;
  note: string | null;
  sort_order: number;
};

export type RecipeStep = {
  id: string;
  recipe_id: string;
  sort_order: number;
  text: string;
  timer_minutes: number | null;
};

export type MealLog = {
  id: string;
  recipe_id: string;
  eaten_on: string; // YYYY-MM-DD
  plan_day_id: string | null;
  created_at: string;
};

export type Rating = {
  id: string;
  recipe_id: string;
  meal_log_id: string | null;
  user_id: string;
  score: number;
  note: string | null;
  created_at: string;
};

export type PlanDayKind = "recipe" | "rugbrod" | "ude" | "rester" | "fri";

export type PlanDay = {
  id: string;
  day: string; // YYYY-MM-DD
  kind: PlanDayKind;
  recipe_id: string | null;
  servings: number | null;
  free_text: string | null;
  locked: boolean;
};

export type ShoppingItem = {
  id: string;
  ingredient_id: string | null;
  name: string;
  amount: number | null;
  unit: string | null;
  category_id: string | null;
  sources: string[];
  checked: boolean;
  checked_at: string | null;
  created_at: string;
};

export type MemberName = {
  user_id: string;
  name: string;
  email: string;
  is_admin: boolean;
};

export type AppUser = {
  user_id: string;
  email: string;
  name: string | null;
  is_member: boolean;
  is_admin: boolean;
};

export type PlannerSettings = {
  /** Hvor meget weekendmad foretrækkes fredag/lørdag (og nedprioriteres ellers). */
  weekendFactor: number;
  /** Retter spist inden for dette antal dage foreslås ikke. */
  excludeDays: number;
  /** Maks. antal dage med samme hovedingrediens pr. uge. */
  maxMainPerWeek: number;
  /** Standard antal personer i ugeplanen. */
  defaultServings: number;
  /** Antal seneste vurderinger der indgår i en rets score i planlæggeren. */
  recentRatings: number;
};

export const DEFAULT_PLANNER: PlannerSettings = {
  weekendFactor: 4,
  excludeDays: 14,
  maxMainPerWeek: 2,
  defaultServings: 4,
  recentRatings: 6,
};

/** Standarduge: ISO-ugedag (1 = mandag … 7 = søndag) → dagtype */
export type WeekTemplate = Record<string, PlanDayKind>;

/** Opskrift som den bruges i lister: med tags, vurderinger og spist-historik. */
export type RecipeListItem = Recipe & {
  tag_ids: string[];
  avg_score: number | null;
  rating_count: number;
  recent_score: number | null;
  last_eaten: string | null;
  times_eaten: number;
  ingredient_ids: string[];
};

/** Fuld opskrift til visning og redigering. */
export type RecipeDetail = Recipe & {
  ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
  steps: RecipeStep[];
  tag_ids: string[];
  ratings: Rating[];
  meals: MealLog[];
};
