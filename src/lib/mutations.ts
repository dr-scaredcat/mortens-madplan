import { supabase, unwrap, IMAGE_BUCKET, publicImageUrl } from "@/lib/supabase";
import { compressImage } from "@/lib/image-utils";
import { todayISO } from "@/lib/format";
import type { Ingredient } from "@/lib/types";

// ─── Opskrifter ─────────────────────────────────────────────────────────────

export type RecipeDraft = {
  title: string;
  description: string;
  servings: number;
  prep_minutes: number | null;
  image_url: string | null;
  source_url: string;
  tag_ids: string[];
  ingredients: {
    ingredient_id: string;
    amount: number | null;
    unit: string | null;
    note: string | null;
    section?: string | null;
  }[];
  steps: { text: string; timer_minutes: number | null; section?: string | null }[];
};

/** Opret eller opdatér en opskrift inkl. ingredienser, trin og tags. */
export async function saveRecipe(draft: RecipeDraft, id?: string): Promise<string> {
  const recipeRow = {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    servings: draft.servings,
    prep_minutes: draft.prep_minutes,
    image_url: draft.image_url,
    source_url: draft.source_url.trim() || null,
  };

  let recipeId = id;
  if (recipeId) {
    unwrap(await supabase.from("recipes").update(recipeRow).eq("id", recipeId));
  } else {
    const created = unwrap(
      await supabase.from("recipes").insert(recipeRow).select("id").single(),
    ) as { id: string };
    recipeId = created.id;
  }

  // Børnetabeller erstattes helt — enkelt og robust for husstandsbrug.
  unwrap(await supabase.from("recipe_ingredients").delete().eq("recipe_id", recipeId));
  unwrap(await supabase.from("recipe_steps").delete().eq("recipe_id", recipeId));
  unwrap(await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId));

  if (draft.ingredients.length) {
    unwrap(
      await supabase.from("recipe_ingredients").insert(
        draft.ingredients.map((i, idx) => ({
          recipe_id: recipeId,
          ingredient_id: i.ingredient_id,
          amount: i.amount,
          unit: i.unit?.trim() || null,
          note: i.note?.trim() || null,
          section: i.section?.trim() || null,
          sort_order: idx,
        })),
      ),
    );
  }
  const steps = draft.steps.filter((s) => s.text.trim());
  if (steps.length) {
    unwrap(
      await supabase.from("recipe_steps").insert(
        steps.map((s, idx) => ({
          recipe_id: recipeId,
          text: s.text.trim(),
          timer_minutes: s.timer_minutes,
          section: s.section?.trim() || null,
          sort_order: idx,
        })),
      ),
    );
  }
  if (draft.tag_ids.length) {
    unwrap(
      await supabase
        .from("recipe_tags")
        .insert(draft.tag_ids.map((tag_id) => ({ recipe_id: recipeId, tag_id }))),
    );
  }
  return recipeId!;
}

export async function deleteRecipe(id: string) {
  unwrap(await supabase.from("recipes").delete().eq("id", id));
}

export async function uploadRecipeImage(file: File): Promise<string> {
  const compressed = await compressImage(file, 1400, 0.82);
  const ext = compressed.type === "image/png" ? "png" : "jpg";
  const path = `recipes/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, compressed, { contentType: compressed.type, upsert: false });
  if (error) throw new Error(`Upload fejlede: ${error.message}`);
  return publicImageUrl(path);
}

/** Slet et billede fra appens bucket (ignorerer eksterne URL'er). */
export async function removeStoredImage(url: string | null | undefined) {
  if (!url) return;
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return;
  const path = decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
  await supabase.storage.from(IMAGE_BUCKET).remove([path]);
}

// ─── Ingredienser ───────────────────────────────────────────────────────────

export async function createIngredient(input: {
  name: string;
  category_id: string | null;
  default_unit: string | null;
  is_staple?: boolean;
}): Promise<Ingredient> {
  return unwrap(
    await supabase
      .from("ingredients")
      .insert({
        name: input.name.trim(),
        category_id: input.category_id,
        default_unit: input.default_unit?.trim() || null,
        is_staple: input.is_staple ?? false,
      })
      .select("*")
      .single(),
  ) as Ingredient;
}

// ─── Spist-log og vurderinger ──────────────────────────────────────────────

/** Registrér at en ret er spist på en dato (genbruger eksisterende registrering samme dag). */
export async function logMeal(recipeId: string, date = todayISO()): Promise<string> {
  const existing = unwrap(
    await supabase
      .from("meal_log")
      .select("id")
      .eq("recipe_id", recipeId)
      .eq("eaten_on", date)
      .limit(1)
      .maybeSingle(),
  ) as { id: string } | null;
  if (existing) return existing.id;
  const row = unwrap(
    await supabase
      .from("meal_log")
      .insert({ recipe_id: recipeId, eaten_on: date })
      .select("id")
      .single(),
  ) as { id: string };
  return row.id;
}

export async function deleteMeal(id: string) {
  unwrap(await supabase.from("meal_log").delete().eq("id", id));
}

export async function saveRating(input: {
  id?: string;
  recipe_id: string;
  meal_log_id: string | null;
  score: number;
  note: string;
}) {
  const row = {
    recipe_id: input.recipe_id,
    meal_log_id: input.meal_log_id,
    score: input.score,
    note: input.note.trim() || null,
  };
  if (input.id) {
    unwrap(await supabase.from("ratings").update(row).eq("id", input.id));
  } else {
    unwrap(await supabase.from("ratings").insert(row));
  }
}

export async function deleteRating(id: string) {
  unwrap(await supabase.from("ratings").delete().eq("id", id));
}

// ─── Indkøbsliste og varelager ─────────────────────────────────────────────

export type ShoppingInput = {
  ingredient_id?: string | null;
  name?: string;
  amount?: number | null;
  unit?: string | null;
  category_id?: string | null;
  source?: string | null;
};

/**
 * Læg varer på indkøbslisten. Databasen lægger ens varer (samme ingrediens og
 * enhed) sammen og matcher fritekst mod ingredienskataloget.
 */
export async function addShoppingItems(items: ShoppingInput[]): Promise<number> {
  if (!items.length) return 0;
  return unwrap(await supabase.rpc("add_shopping_items", { items })) as number;
}

export async function setShoppingChecked(id: string, checked: boolean) {
  unwrap(await supabase.from("shopping_items").update({ checked }).eq("id", id));
}

export async function updateShoppingItem(
  id: string,
  patch: Partial<{
    name: string;
    amount: number | null;
    unit: string | null;
    category_id: string | null;
    ingredient_id: string | null;
  }>,
) {
  unwrap(await supabase.from("shopping_items").update(patch).eq("id", id));
}

export async function deleteShoppingItem(id: string) {
  unwrap(await supabase.from("shopping_items").delete().eq("id", id));
}

export async function clearCheckedShopping() {
  unwrap(await supabase.from("shopping_items").delete().eq("checked", true));
}

export async function clearAllShopping() {
  unwrap(
    await supabase
      .from("shopping_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"),
  );
}

/** "Løbet tør": markér basisvaren og læg den på indkøbslisten. */
export async function markOutOfStock(ingredientId: string) {
  unwrap(await supabase.rpc("mark_out_of_stock", { p_ingredient_id: ingredientId }));
}

export async function updateIngredient(
  id: string,
  patch: Partial<Pick<Ingredient, "name" | "category_id" | "default_unit" | "is_staple" | "in_stock">>,
) {
  unwrap(await supabase.from("ingredients").update(patch).eq("id", id));
}

// ─── Ugeplan ────────────────────────────────────────────────────────────────

export type PlanDayRow = {
  day: string;
  kind: "recipe" | "rugbrod" | "ude" | "rester" | "fri";
  recipe_id: string | null;
  servings: number | null;
  free_text: string | null;
  locked: boolean;
};

/**
 * Opret eller opdatér dage i ugeplanen (én række pr. dato). Rækkerne sendes
 * altid komplette, så en upsert aldrig nulstiller felter ved et uheld.
 */
export async function upsertPlanDays(rows: PlanDayRow[]) {
  if (!rows.length) return;
  unwrap(await supabase.from("plan_days").upsert(rows, { onConflict: "day" }));
}

/** Registrér passerede dage i ugeplanen som spist. */
export async function syncMealLog() {
  unwrap(await supabase.rpc("sync_meal_log"));
}

export async function dismissRatingPrompt(mealLogId: string) {
  unwrap(
    await supabase
      .from("rating_prompt_dismissals")
      .upsert({ meal_log_id: mealLogId }, { onConflict: "meal_log_id,user_id" }),
  );
}
