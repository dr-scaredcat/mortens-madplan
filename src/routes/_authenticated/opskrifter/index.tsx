import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useIngredients, useRecipes, useTags } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard } from "@/components/app/recipe-card";
import { TagChips } from "@/components/app/tag-filter";
import { cn } from "@/lib/utils";
import type { RecipeListItem } from "@/lib/types";

type SortKey = "name" | "score" | "oldest" | "newest";

type Search = { q?: string; tags?: string[]; sort?: SortKey };

export const Route = createFileRoute("/_authenticated/opskrifter/")({
  head: () => ({ meta: [{ title: "Opskrifter — Astons Køkken" }] }),
  // Søgning og filtre gemmes i URL'en, så de huskes ved "tilbage"
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    tags: Array.isArray(s.tags) && s.tags.length ? (s.tags as string[]) : undefined,
    sort: ["name", "score", "oldest", "newest"].includes(s.sort as string)
      ? (s.sort as SortKey)
      : undefined,
  }),
  component: RecipesPage,
});

const SORTS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Navn" },
  { key: "score", label: "Bedste score" },
  { key: "oldest", label: "Længst siden spist" },
  { key: "newest", label: "Nyeste opskrifter" },
];

function sortRecipes(list: RecipeListItem[], key: SortKey) {
  const arr = [...list];
  switch (key) {
    case "score":
      return arr.sort((a, b) => (b.avg_score ?? -1) - (a.avg_score ?? -1) || a.title.localeCompare(b.title));
    case "oldest":
      return arr.sort((a, b) => (a.last_eaten ?? "").localeCompare(b.last_eaten ?? "") || a.title.localeCompare(b.title));
    case "newest":
      return arr.sort((a, b) => b.created_at.localeCompare(a.created_at));
    default:
      return arr.sort((a, b) => a.title.localeCompare(b.title, "da"));
  }
}

function RecipesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: recipes, isLoading, error } = useRecipes();
  const { data: tags = [] } = useTags();
  const { data: ingredients = [] } = useIngredients();
  const [showFilters, setShowFilters] = useState((search.tags?.length ?? 0) > 0);

  const q = search.q ?? "";
  const selected = search.tags ?? [];
  const sort = search.sort ?? "name";

  const setSearch = (patch: Partial<Search>) =>
    navigate({ search: (prev: Search) => ({ ...prev, ...patch }), replace: true });

  const tagMap = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);
  const ingredientNames = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i.name.toLowerCase()])),
    [ingredients],
  );

  const { filtered, counts } = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const textMatch = (r: RecipeListItem) =>
      !needle ||
      r.title.toLowerCase().includes(needle) ||
      (r.description ?? "").toLowerCase().includes(needle) ||
      r.ingredient_ids.some((id) => ingredientNames.get(id)?.includes(needle)) ||
      r.tag_ids.some((id) => tagMap.get(id)?.name.toLowerCase().includes(needle));

    const base = (recipes ?? []).filter(textMatch);
    const filtered = base.filter((r) => selected.every((id) => r.tag_ids.includes(id)));
    const counts = new Map<string, number>();
    for (const r of filtered) for (const id of r.tag_ids) counts.set(id, (counts.get(id) ?? 0) + 1);
    return { filtered: sortRecipes(filtered, sort), counts };
  }, [recipes, q, selected, sort, ingredientNames, tagMap]);

  const toggleTag = (id: string) =>
    setSearch({
      tags: selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id],
    });

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 pb-safe">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Opskrifter</h1>
          <p className="text-sm text-muted-foreground">
            {recipes ? `${filtered.length} af ${recipes.length} opskrifter` : " "}
          </p>
        </div>
        <Button asChild>
          <Link to="/opskrifter/ny">
            <Plus className="mr-1 h-4 w-4" />
            Ny opskrift
          </Link>
        </Button>
      </div>

      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setSearch({ q: e.target.value || undefined })}
            placeholder="Søg efter ret, ingrediens eller tag…"
            className="bg-card pl-9 pr-9"
          />
          {q && (
            <button
              type="button"
              aria-label="Ryd søgning"
              onClick={() => setSearch({ q: undefined })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className={cn("bg-card", selected.length > 0 && "border-primary/50 text-primary")}
        >
          <SlidersHorizontal className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Filtre</span>
          {selected.length > 0 && <span className="ml-1">({selected.length})</span>}
        </Button>
      </div>

      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sortér:</span>
        <Select value={sort} onValueChange={(v) => setSearch({ sort: v as SortKey })}>
          <SelectTrigger className="h-8 w-48 bg-card text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <TagChips
            selected={selected}
            onToggle={toggleTag}
            counts={counts}
            onClear={() => setSearch({ tags: undefined })}
          />
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <p className="text-muted-foreground">Indlæser opskrifter…</p>
      ) : recipes && recipes.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Ingen opskrifter matcher.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} tags={tagMap} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
      <h2 className="font-serif text-xl">Ingen opskrifter endnu</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Opret jeres første opskrift — eller importér en fra en madside ved at indsætte et link.
      </p>
      <Button asChild className="mt-5">
        <Link to="/opskrifter/ny">
          <Plus className="mr-1 h-4 w-4" />
          Ny opskrift
        </Link>
      </Button>
    </div>
  );
}
