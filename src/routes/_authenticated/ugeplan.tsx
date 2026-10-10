import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  LockOpen,
  Search,
  Shuffle,
  ShoppingCart,
  Sparkles,
  UtensilsCrossed,
  Wheat,
  Soup,
  PenLine,
  CookingPot,
  ListPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarsDisplay } from "@/components/app/rating-stars";
import { RecipeImage } from "@/components/app/recipe-image";
import {
  AddToShoppingDialog,
  type ShoppingSource,
} from "@/components/app/add-to-shopping-dialog";
import { useRealtimeInvalidate } from "@/hooks/use-realtime";
import {
  fetchRecipe,
  usePlanDays,
  useRecipes,
  useSettings,
  useTagGroups,
  useTags,
} from "@/lib/queries";
import { upsertPlanDays, type PlanDayRow } from "@/lib/mutations";
import {
  addDays,
  isoWeekday,
  isWeekendDay,
  scoreForDay,
  suggestDays,
  suggestForDay,
  type PlannerContext,
} from "@/lib/planner";
import {
  formatAgo,
  formatDate,
  parseISODate,
  todayISO,
  WEEKDAYS,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PlanDayKind, RecipeListItem } from "@/lib/types";

type Search = { uge?: string };

export const Route = createFileRoute("/_authenticated/ugeplan")({
  head: () => ({ meta: [{ title: "Ugeplan — Astons Køkken" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    uge: typeof s.uge === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.uge) ? s.uge : undefined,
  }),
  component: WeekPlanPage,
});

const KINDS: { value: PlanDayKind; label: string; icon: typeof Wheat }[] = [
  { value: "recipe", label: "Opskrift", icon: CookingPot },
  { value: "rugbrod", label: "Rugbrød", icon: Wheat },
  { value: "ude", label: "Spiser ude", icon: UtensilsCrossed },
  { value: "rester", label: "Rester", icon: Soup },
  { value: "fri", label: "Andet", icon: PenLine },
];

function mondayOf(iso: string): string {
  return addDays(iso, -(isoWeekday(iso) - 1));
}

function isoWeekNumber(iso: string): number {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function WeekPlanPage() {
  const qc = useQueryClient();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const today = todayISO();
  const weekStart = mondayOf(search.uge ?? today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Hent også ugerne omkring, så forslag undgår gentagelser hen over ugeskift
  const rangeFrom = addDays(weekStart, -14);
  const rangeTo = addDays(weekStart, 20);
  const { data: planRows = [], isLoading } = usePlanDays(rangeFrom, rangeTo);
  const { data: recipes = [] } = useRecipes();
  const { data: tags = [] } = useTags();
  const { data: groups = [] } = useTagGroups();
  const { data: settings } = useSettings();
  useRealtimeInvalidate("plan_days", [["plan-days"], ["recipes"]]);

  const [picking, setPicking] = useState<string | null>(null);
  const [shopSources, setShopSources] = useState<ShoppingSource[] | null>(null);
  const [busy, setBusy] = useState(false);

  const recipeMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const rowMap = useMemo(() => new Map(planRows.map((r) => [r.day, r])), [planRows]);
  const defaultServings = settings?.planner.defaultServings ?? 4;

  /** Den viste dag: gemt række, ellers standardugen fra indstillingerne. */
  const dayRow = (day: string): PlanDayRow => {
    const r = rowMap.get(day);
    if (r) {
      return {
        day,
        kind: r.kind,
        recipe_id: r.recipe_id,
        servings: r.servings,
        free_text: r.free_text,
        locked: r.locked,
      };
    }
    const kind = settings?.weekTemplate[String(isoWeekday(day))] ?? "recipe";
    return { day, kind, recipe_id: null, servings: null, free_text: null, locked: false };
  };

  const ctx = (): PlannerContext => {
    const planned = new Map<string, string>();
    for (const r of planRows) if (r.kind === "recipe" && r.recipe_id) planned.set(r.day, r.recipe_id);
    return {
      recipes,
      tags,
      groups,
      settings: settings!.planner,
      planned,
    };
  };

  async function save(rows: PlanDayRow[]) {
    // Optimistisk visning
    qc.setQueryData(["plan-days", rangeFrom, rangeTo], (old: typeof planRows | undefined) => {
      const map = new Map((old ?? []).map((r) => [r.day, r]));
      for (const row of rows) {
        const prev = map.get(row.day);
        map.set(row.day, { id: prev?.id ?? `tmp-${row.day}`, ...row });
      }
      return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
    });
    try {
      await upsertPlanDays(rows);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      await qc.invalidateQueries({ queryKey: ["plan-days"] });
    }
  }

  const update = (day: string, patch: Partial<PlanDayRow>) => save([{ ...dayRow(day), ...patch }]);

  async function suggestWeek() {
    if (!settings) return;
    if (recipes.length === 0) return toast.error("Opret nogle opskrifter først.");
    const targets = weekDays.filter((d) => {
      const r = dayRow(d);
      return d >= today && r.kind === "recipe" && !r.locked;
    });
    if (targets.length === 0) {
      return toast.info("Ingen ulåste opskriftsdage fra i dag og frem i denne uge.");
    }
    const replacing = targets.filter((d) => dayRow(d).recipe_id).length;
    if (replacing > 0 && !confirm(`Erstat ${replacing} ulåste ret${replacing > 1 ? "ter" : ""} med nye forslag?`)) {
      return;
    }
    setBusy(true);
    const picks = suggestDays(targets, ctx());
    // Gem hele ugen, så standardugens dagtyper også bliver gemt
    await save(
      weekDays.map((d) => {
        const row = dayRow(d);
        return picks.has(d) ? { ...row, recipe_id: picks.get(d)! } : row;
      }),
    );
    setBusy(false);
    toast.success("Ugen er planlagt — lås de dage I er glade for, og bed om nye forslag til resten.");
  }

  function reroll(day: string) {
    if (!settings) return;
    const current = dayRow(day).recipe_id;
    const c = ctx();
    c.planned.delete(day);
    const avoid = new Set<string>(
      weekDays.map((d) => c.planned.get(d)).filter((x): x is string => !!x),
    );
    if (current) avoid.add(current);
    const pick = suggestForDay(day, c, avoid);
    if (!pick) return toast.error("Ingen opskrifter at vælge imellem.");
    void update(day, { kind: "recipe", recipe_id: pick.id });
  }

  async function weekToShopping() {
    const days = weekDays.filter((d) => d >= today).map(dayRow).filter((r) => r.kind === "recipe" && r.recipe_id);
    if (days.length === 0) return toast.info("Der er ingen retter at købe ind til i resten af ugen.");
    setBusy(true);
    try {
      const details = await Promise.all(
        [...new Set(days.map((d) => d.recipe_id!))].map((id) =>
          qc.fetchQuery({ queryKey: ["recipe", id], queryFn: () => fetchRecipe(id) }),
        ),
      );
      const byId = new Map(details.filter(Boolean).map((r) => [r!.id, r!]));
      const sources: ShoppingSource[] = days
        .map((d) => {
          const r = byId.get(d.recipe_id!);
          if (!r) return null;
          return {
            title: `${WEEKDAYS[isoWeekday(d.day) - 1].slice(0, 3)}: ${r.title}`,
            recipeServings: r.servings,
            servings: d.servings ?? defaultServings,
            ingredients: r.ingredients,
          };
        })
        .filter((x): x is ShoppingSource => !!x);
      setShopSources(sources);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const goWeek = (offset: number) =>
    navigate({ search: { uge: addDays(weekStart, offset * 7) }, replace: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 pb-safe">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" onClick={() => goWeek(-1)} aria-label="Forrige uge">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-serif text-3xl">Uge {isoWeekNumber(weekStart)}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}
            {weekStart !== mondayOf(today) && (
              <>
                {" · "}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => navigate({ search: {}, replace: true })}
                >
                  denne uge
                </button>
              </>
            )}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => goWeek(1)} aria-label="Næste uge">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Button onClick={suggestWeek} disabled={busy || !settings || isLoading} className="flex-1 sm:flex-none">
          <Sparkles className="mr-1 h-4 w-4" />
          Lav forslag til ugen
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-card sm:flex-none"
          onClick={weekToShopping}
          disabled={busy}
        >
          <ShoppingCart className="mr-1 h-4 w-4" />
          Hele ugen på indkøbslisten
        </Button>
      </div>

      {recipes.length === 0 && !isLoading && (
        <div className="mb-4 rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Der er ingen opskrifter endnu.{" "}
          <Link to="/opskrifter/ny" className="text-primary underline">
            Opret den første
          </Link>
          , så kan ugeplanen lave forslag.
        </div>
      )}

      <div className="space-y-3">
        {weekDays.map((day) => {
          const row = dayRow(day);
          const recipe = row.recipe_id ? recipeMap.get(row.recipe_id) : undefined;
          const past = day < today;
          const isToday = day === today;
          return (
            <Card
              key={day}
              className={cn(
                "p-3 sm:p-4",
                isToday && "ring-2 ring-primary/60",
                past && "opacity-70",
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-lg leading-tight">
                    {WEEKDAYS[isoWeekday(day) - 1]}
                    {isWeekendDay(day) && (
                      <Badge variant="outline" className="ml-2 align-middle text-[10px] font-normal">
                        weekend
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(day)}
                    {isToday && " · i dag"}
                  </p>
                </div>
                <Select value={row.kind} onValueChange={(v) => update(day, { kind: v as PlanDayKind })}>
                  <SelectTrigger className="h-8 w-36 bg-card text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant={row.locked ? "default" : "ghost"}
                  className="h-8 w-8 shrink-0"
                  onClick={() => update(day, { locked: !row.locked })}
                  aria-label={row.locked ? "Lås op" : "Lås dagen"}
                  title={row.locked ? "Låst — ændres ikke af forslag" : "Lås dagen"}
                >
                  {row.locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
                </Button>
              </div>

              {row.kind === "recipe" ? (
                <div className="flex gap-3">
                  {recipe ? (
                    <Link
                      to="/opskrifter/$id"
                      params={{ id: recipe.id }}
                      className="flex min-w-0 flex-1 items-center gap-3"
                    >
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        <RecipeImage src={recipe.image_url} alt={recipe.title} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{recipe.title}</p>
                        <StarsDisplay value={recipe.avg_score} showEmptyText={false} />
                        <p className="text-xs text-muted-foreground">
                          {recipe.last_eaten && recipe.last_eaten !== day
                            ? `Sidst spist ${formatAgo(recipe.last_eaten)}`
                            : recipe.last_eaten
                              ? ""
                              : "Ikke spist før"}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <p className="flex-1 self-center text-sm text-muted-foreground">
                      {row.recipe_id ? "Opskriften findes ikke længere." : "Ingen ret valgt endnu."}
                    </p>
                  )}
                </div>
              ) : row.kind === "fri" ? (
                <Input
                  key={`${day}-${row.free_text ?? ""}`}
                  defaultValue={row.free_text ?? ""}
                  placeholder="Hvad skal I have?"
                  className="bg-card"
                  onBlur={(e) => {
                    const v = e.target.value.trim() || null;
                    if (v !== row.free_text) void update(day, { free_text: v });
                  }}
                />
              ) : (
                <KindLabel kind={row.kind} />
              )}

              {row.kind === "recipe" && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-card"
                    onClick={() => reroll(day)}
                    disabled={!settings || recipes.length === 0}
                  >
                    <Shuffle className="mr-1 h-3.5 w-3.5" />
                    {recipe ? "Nyt forslag" : "Foreslå"}
                  </Button>
                  <Button size="sm" variant="outline" className="bg-card" onClick={() => setPicking(day)}>
                    <ListPlus className="mr-1 h-3.5 w-3.5" />
                    Vælg selv
                  </Button>
                  <Select
                    value={String(row.servings ?? defaultServings)}
                    onValueChange={(v) => update(day, { servings: Number(v) })}
                  >
                    <SelectTrigger className="ml-auto h-8 w-24 bg-card text-sm" aria-label="Antal personer">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} pers.
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {picking && settings && (
        <RecipePickerDialog
          day={picking}
          ctx={ctx()}
          onClose={() => setPicking(null)}
          onPick={(r) => {
            void update(picking, { kind: "recipe", recipe_id: r.id });
            setPicking(null);
          }}
        />
      )}

      <AddToShoppingDialog
        open={!!shopSources}
        onOpenChange={(o) => !o && setShopSources(null)}
        sources={shopSources ?? []}
        title="Ugens indkøb"
      />
    </main>
  );
}

function KindLabel({ kind }: { kind: PlanDayKind }) {
  const k = KINDS.find((x) => x.value === kind)!;
  const Icon = k.icon;
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-5 w-5" />
      {k.label}
    </p>
  );
}

/** Vælg selv en ret. Listen er sorteret efter, hvor godt retten passer til dagen. */
function RecipePickerDialog({
  day,
  ctx,
  onClose,
  onPick,
}: {
  day: string;
  ctx: PlannerContext;
  onClose: () => void;
  onPick: (r: RecipeListItem) => void;
}) {
  const [q, setQ] = useState("");
  const weekendTagIds = useMemo(() => new Set(ctx.tags.filter((t) => t.is_weekend).map((t) => t.id)), [ctx.tags]);
  const scored = useMemo(() => {
    const c = { ...ctx, planned: new Map(ctx.planned) };
    c.planned.delete(day);
    return scoreForDay(day, c).sort(
      (a, b) =>
        Number(a.manualOnly) - Number(b.manualOnly) ||
        Number(a.excluded) - Number(b.excluded) ||
        b.weight - a.weight,
    );
  }, [ctx, day]);

  const needle = q.trim().toLowerCase();
  const list = scored.filter((s) => !needle || s.recipe.title.toLowerCase().includes(needle));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90dvh] flex-col">
        <DialogHeader>
          <DialogTitle>Vælg ret</DialogTitle>
          <DialogDescription>
            {WEEKDAYS[isoWeekday(day) - 1]} {formatDate(day)} — bedste forslag øverst.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg…" className="pl-9" autoFocus />
        </div>
        <ul className="-mx-2 flex-1 divide-y divide-border overflow-y-auto">
          {list.map(({ recipe, excluded, manualOnly }) => (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => onPick(recipe)}
                className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-muted"
              >
                <div className="h-12 w-14 shrink-0 overflow-hidden rounded bg-muted">
                  <RecipeImage src={recipe.image_url} alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    <span className="truncate">{recipe.title}</span>
                    {recipe.tag_ids.some((t) => weekendTagIds.has(t)) && (
                      <Badge className="shrink-0 px-1.5 py-0 text-[10px] font-normal">weekend</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {recipe.avg_score != null ? `★ ${recipe.avg_score.toFixed(1).replace(".", ",")} · ` : ""}
                    {recipe.last_eaten ? `spist ${formatAgo(recipe.last_eaten)}` : "ikke spist før"}
                    {excluded && " · for nylig"}
                    {manualOnly && " · aldrig automatisk"}
                  </p>
                </div>
              </button>
            </li>
          ))}
          {list.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">Ingen opskrifter matcher.</li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

