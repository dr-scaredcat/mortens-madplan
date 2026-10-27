import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck,
  ChefHat,
  Clock,
  ExternalLink,
  Minus,
  Pencil,
  Plus,
  ShoppingCart,
  Star,
  Sun,
  Timer,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StarsDisplay } from "@/components/app/rating-stars";
import { RecipeImage } from "@/components/app/recipe-image";
import { RateDialog } from "@/components/app/rate-dialog";
import { CookMode } from "@/components/app/cook-mode";
import { AddToShoppingDialog } from "@/components/app/add-to-shopping-dialog";
import { RecipeWine } from "@/components/app/recipe-wine";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { useMe, useMemberNames, useRecipe, useSettings, useTags } from "@/lib/queries";
import { DEFAULT_PLANNER } from "@/lib/types";
import { deleteMeal, deleteRating, logMeal } from "@/lib/mutations";
import {
  formatAgo,
  formatDate,
  formatMinutes,
  formatQuantity,
  scaleAmount,
  todayISO,
} from "@/lib/format";
import { groupBySection } from "@/lib/sections";
import type { Rating } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/opskrifter/$id/")({
  head: () => ({ meta: [{ title: "Opskrift — Astons Køkken" }] }),
  component: RecipePage,
});

function RecipePage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: recipe, isLoading, error } = useRecipe(id);
  const { data: tags = [] } = useTags();
  const { data: me } = useMe();
  const { data: members = [] } = useMemberNames();
  const { data: settings } = useSettings();
  const wake = useWakeLock(false);

  const [servings, setServings] = useState<number | null>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [editingRating, setEditingRating] = useState<Rating | null>(null);
  const [cooking, setCooking] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [addDate, setAddDate] = useState(todayISO());

  const names = useMemo(() => new Map(members.map((m) => [m.user_id, m.name])), [members]);

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-6 text-muted-foreground">Indlæser…</main>;
  }
  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {(error as Error).message}
        </div>
      </main>
    );
  }
  if (!recipe) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p>Opskriften findes ikke.</p>
        <Link to="/opskrifter" className="text-primary underline">
          Tilbage til opskrifter
        </Link>
      </main>
    );
  }

  // Opskrifter vises som standard for det antal personer, der er valgt i admin (2)
  const people =
    servings ?? settings?.planner.viewServings ?? DEFAULT_PLANNER.viewServings;
  const recipeTags = tags.filter((t) => recipe.tag_ids.includes(t.id));
  const avg = recipe.ratings.length
    ? recipe.ratings.reduce((s, r) => s + r.score, 0) / recipe.ratings.length
    : null;
  const myRatings = recipe.ratings.filter((r) => r.user_id === me?.userId);
  const lastEaten = recipe.meals[0]?.eaten_on ?? null;
  const ratingByMeal = new Map<string, Rating[]>();
  for (const r of recipe.ratings) {
    if (!r.meal_log_id) continue;
    ratingByMeal.set(r.meal_log_id, [...(ratingByMeal.get(r.meal_log_id) ?? []), r]);
  }

  const invalidate = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["recipe", id] }),
      qc.invalidateQueries({ queryKey: ["recipes"] }),
    ]);

  async function addMeal() {
    try {
      await logMeal(id, addDate);
      await invalidate();
      toast.success(`Registreret som spist ${formatDate(addDate)}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-4 pb-safe">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/opskrifter">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Opskrifter
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="bg-card">
          <Link to="/opskrifter/$id/rediger" params={{ id }}>
            <Pencil className="mr-1 h-4 w-4" />
            Redigér
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <RecipeImage src={recipe.image_url} alt={recipe.title} />
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{recipe.title}</h1>
          {recipe.description && (
            <p className="whitespace-pre-line text-muted-foreground">{recipe.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <StarsDisplay value={avg} count={recipe.ratings.length} />
            {recipe.prep_minutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatMinutes(recipe.prep_minutes)}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <CalendarCheck className="h-4 w-4" />
              {lastEaten ? `Sidst spist ${formatAgo(lastEaten)}` : "Ikke spist endnu"}
            </span>
            {recipe.source_url && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                Kilde
              </a>
            )}
          </div>
          {recipeTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipeTags.map((t) => (
                <Link key={t.id} to="/opskrifter" search={{ tags: [t.id] }}>
                  <Badge variant={t.is_weekend ? "default" : "secondary"}>{t.name}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Handlinger */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={() => setCooking(true)}>
          <ChefHat className="mr-1 h-4 w-4" />
          Madlavningstilstand
        </Button>
        <Button variant="outline" className="bg-card" onClick={() => setShopOpen(true)}>
          <ShoppingCart className="mr-1 h-4 w-4" />
          Til indkøbslisten
        </Button>
        <Button
          variant="outline"
          className="bg-card"
          onClick={() => {
            setEditingRating(null);
            setRateOpen(true);
          }}
        >
          <Star className="mr-1 h-4 w-4" />
          Giv score
        </Button>
        <label className="ml-auto flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm">
          <Sun className={wake.active ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
          <span>Hold skærmen tændt</span>
          <Switch
            checked={wake.enabled}
            disabled={!wake.supported}
            onCheckedChange={wake.setEnabled}
            aria-label="Hold skærmen tændt"
          />
        </label>
      </div>
      {!wake.supported && (
        <p className="mt-1 text-right text-xs text-muted-foreground">
          Din browser understøtter ikke “hold skærmen tændt”.
        </p>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Ingredienser */}
        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-serif text-2xl">Ingredienser</h2>
            <ServingsStepper value={people} onChange={setServings} />
          </div>
          {people !== recipe.servings && (
            <p className="mb-2 text-xs text-muted-foreground">
              Skaleret fra {recipe.servings} personer.{" "}
              <button className="underline" onClick={() => setServings(recipe.servings)}>
                Vis original
              </button>
            </p>
          )}
          {recipe.ingredients.length === 0 && (
            <Card className="p-4 text-sm text-muted-foreground">Ingen ingredienser.</Card>
          )}
          <div className="space-y-3">
            {groupBySection(recipe.ingredients).map((g, gi) => (
              <div key={gi}>
                {g.section && (
                  <h3 className="heading-sm mb-1 px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {g.section}
                  </h3>
                )}
                <Card className="divide-y divide-border">
                  {g.items.map((i) => (
                    <div key={i.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                      <span>
                        {i.ingredient.name}
                        {i.note && <span className="text-sm text-muted-foreground">, {i.note}</span>}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {formatQuantity(scaleAmount(i.amount, recipe.servings, people), i.unit)}
                      </span>
                    </div>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Fremgangsmåde */}
        <section>
          <h2 className="mb-2 font-serif text-2xl">Fremgangsmåde</h2>
          {recipe.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen trin beskrevet.</p>
          ) : (
            <ol className="space-y-4">
              {recipe.steps.map((s, idx) => (
                <li key={s.id} className="space-y-2">
                  {s.section && s.section !== recipe.steps[idx - 1]?.section && (
                    <h3 className="heading-sm pt-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {s.section}
                    </h3>
                  )}
                  <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="whitespace-pre-line leading-relaxed">{s.text}</p>
                    {s.timer_minutes && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer className="h-3.5 w-3.5" />
                        {s.timer_minutes} min
                      </span>
                    )}
                  </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Noter og vurderinger */}
      <section className="mt-8">
        <h2 className="mb-2 font-serif text-2xl">Noter og vurderinger</h2>
        {recipe.ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen vurderinger endnu. Giv retten en score, når I har lavet den — noter til næste gang
            vises her.
          </p>
        ) : (
          <Card className="divide-y divide-border">
            {recipe.ratings.map((r) => {
              const mine = r.user_id === me?.userId;
              return (
                <div key={r.id} className="flex gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className="font-medium">{names.get(r.user_id) ?? "Ukendt"}</span>
                      <StarsDisplay value={r.score} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.created_at.slice(0, 10))}
                      </span>
                    </div>
                    {r.note && <p className="mt-1 whitespace-pre-line text-sm">{r.note}</p>}
                  </div>
                  {mine && (
                    <div className="flex shrink-0 gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        aria-label="Ret vurdering"
                        onClick={() => {
                          setEditingRating(r);
                          setRateOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Slet vurdering"
                        onClick={async () => {
                          if (!confirm("Slet din vurdering?")) return;
                          try {
                            await deleteRating(r.id);
                            await invalidate();
                          } catch (e) {
                            toast.error((e as Error).message);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </section>

      {/* Vin til retten */}
      <RecipeWine
        recipeId={recipe.id}
        styleId={recipe.wine_style_id}
        suggestion={recipe.wine_suggestion}
      />

      {/* Historik */}
      <section className="mt-8">
        <h2 className="mb-1 font-serif text-2xl">Hvornår har vi fået den?</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Bruges af ugeplanen til at variere retterne. Dage fra ugeplanen registreres automatisk; her
          kan du rette til.
        </p>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input
            type="date"
            className="h-9 w-44 bg-card"
            value={addDate}
            max={todayISO()}
            onChange={(e) => setAddDate(e.target.value || todayISO())}
          />
          <Button variant="outline" size="sm" className="bg-card" onClick={addMeal}>
            <Plus className="mr-1 h-4 w-4" />
            Registrér som spist
          </Button>
        </div>
        {recipe.meals.length > 0 && (
          <Card className="divide-y divide-border">
            {recipe.meals.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">
                  {formatDate(m.eaten_on)}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {m.plan_day_id ? "fra ugeplanen" : "registreret manuelt"}
                    {ratingByMeal.get(m.id)?.length
                      ? ` · ${ratingByMeal.get(m.id)!.length} vurdering${ratingByMeal.get(m.id)!.length > 1 ? "er" : ""}`
                      : ""}
                  </span>
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  aria-label="Fjern"
                  onClick={async () => {
                    if (
                      !confirm(
                        m.plan_day_id
                          ? "Fjern registreringen? Den kommer igen, så længe dagen i ugeplanen har retten — ret i stedet ugeplanen."
                          : "Fjern registreringen?",
                      )
                    )
                      return;
                    try {
                      await deleteMeal(m.id);
                      await invalidate();
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </Card>
        )}
      </section>

      <RateDialog
        open={rateOpen}
        onOpenChange={setRateOpen}
        recipeId={recipe.id}
        recipeTitle={recipe.title}
        meals={recipe.meals}
        myRatings={myRatings}
        editing={editingRating}
      />

      <AddToShoppingDialog
        open={shopOpen}
        onOpenChange={setShopOpen}
        title={`${recipe.title} · ${people} pers.`}
        sources={[
          {
            title: recipe.title,
            recipeServings: recipe.servings,
            servings: people,
            ingredients: recipe.ingredients,
          },
        ]}
      />

      {cooking && <CookMode recipe={recipe} servings={people} onClose={() => setCooking(false)} />}
    </main>
  );
}

function ServingsStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1">
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Færre personer"
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Label className="flex items-center gap-1 px-1 text-sm tabular-nums">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        {value}
      </Label>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full"
        onClick={() => onChange(Math.min(50, value + 1))}
        aria-label="Flere personer"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
