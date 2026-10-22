import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, PackageX, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FindOfferButton } from "@/components/app/find-offer";
import { IngredientPicker } from "@/components/app/ingredient-picker";
import { useRealtimeInvalidate } from "@/hooks/use-realtime";
import { useCategories, useIngredients, useShoppingItems } from "@/lib/queries";
import { markOutOfStock, updateIngredient } from "@/lib/mutations";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/basisvarer")({
  head: () => ({ meta: [{ title: "Basisvarer — Astons Køkken" }] }),
  component: PantryPage,
});

/**
 * Basisvarer: varer I normalt har i køkkenet. "Har vi" betyder at de
 * ikke kommer på indkøbslisten fra opskrifter. "Løbet tør" lægger varen på
 * indkøbslisten; når den krydses af dér, står den som "har vi" igen.
 */
function PantryPage() {
  const qc = useQueryClient();
  const { data: ingredients = [], isLoading } = useIngredients();
  const { data: categories = [] } = useCategories();
  const { data: shopping = [] } = useShoppingItems();
  useRealtimeInvalidate("ingredients", [["ingredients"]]);
  useRealtimeInvalidate("shopping_items", [["shopping"]]);

  const [q, setQ] = useState("");
  const [onlyOut, setOnlyOut] = useState(false);
  const [adding, setAdding] = useState(false);

  const onList = useMemo(
    () => new Set(shopping.filter((s) => !s.checked && s.ingredient_id).map((s) => s.ingredient_id!)),
    [shopping],
  );

  const staples = ingredients.filter((i) => i.is_staple);
  const outCount = staples.filter((i) => !i.in_stock).length;

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = staples.filter(
      (i) => (!needle || i.name.toLowerCase().includes(needle)) && (!onlyOut || !i.in_stock),
    );
    const sections = [
      ...categories.map((c) => ({ id: c.id, name: c.name })),
      { id: "none", name: "Uden kategori" },
    ];
    return sections
      .map((s) => ({
        ...s,
        items: list
          .filter((i) => (i.category_id ?? "none") === s.id)
          .sort((a, b) => a.name.localeCompare(b.name, "da")),
      }))
      .filter((s) => s.items.length > 0);
  }, [staples, categories, q, onlyOut]);

  async function run(fn: () => Promise<unknown>, msg?: string) {
    try {
      await fn();
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["ingredients"] }),
        qc.invalidateQueries({ queryKey: ["shopping"] }),
      ]);
      if (msg) toast.success(msg);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const setStock = (i: Ingredient, inStock: boolean) => {
    qc.setQueryData<Ingredient[]>(["ingredients"], (old) =>
      old?.map((x) => (x.id === i.id ? { ...x, in_stock: inStock } : x)),
    );
    return inStock
      ? run(() => updateIngredient(i.id, { in_stock: true }))
      : run(() => markOutOfStock(i.id), `${i.name} er lagt på indkøbslisten`);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-safe">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Basisvarer</h1>
          <p className="text-sm text-muted-foreground">
            {staples.length} basisvarer{outCount ? ` · ${outCount} løbet tør` : ""}
          </p>
        </div>
        <Button onClick={() => setAdding((v) => !v)} variant={adding ? "secondary" : "default"}>
          {adding ? <X className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {adding ? "Luk" : "Tilføj"}
        </Button>
      </div>

      {adding && (
        <Card className="mb-4 space-y-2 p-4">
          <p className="text-sm">
            Vælg en ingrediens, I normalt har på lager — eller opret en ny.
          </p>
          <IngredientPicker
            value={null}
            onChange={(ing) => {
              if (ing.is_staple) return toast.info(`${ing.name} er allerede en basisvare`);
              void run(
                () => updateIngredient(ing.id, { is_staple: true, in_stock: true }),
                `${ing.name} er tilføjet basisvarerne`,
              );
            }}
          />
        </Card>
      )}

      <div className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg…" className="bg-card pl-9" />
        </div>
        <Button
          variant="outline"
          className={cn("bg-card", onlyOut && "border-primary/50 text-primary")}
          onClick={() => setOnlyOut((v) => !v)}
        >
          Kun løbet tør
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Indlæser…</p>
      ) : groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {staples.length === 0 ? "Ingen basisvarer endnu." : "Ingen matcher."}
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.id}>
              <h2 className="heading-sm mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {g.name}
              </h2>
              <Card className="divide-y divide-border">
                {g.items.map((i) => (
                  <div key={i.id} className="flex items-center gap-2 px-3 py-2">
                    <span className={cn("min-w-0 flex-1 truncate", !i.in_stock && "text-destructive")}>
                      {i.name}
                    </span>
                    {onList.has(i.id) && (
                      <Badge variant="secondary" className="shrink-0 text-[10px] font-normal">
                        På listen
                      </Badge>
                    )}
                    <FindOfferButton name={i.name} />
                    {i.in_stock ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 bg-card"
                        onClick={() => setStock(i, false)}
                      >
                        <PackageX className="mr-1 h-4 w-4" />
                        Løbet tør
                      </Button>
                    ) : (
                      <Button size="sm" className="shrink-0" onClick={() => setStock(i, true)}>
                        <Check className="mr-1 h-4 w-4" />
                        Har vi igen
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-muted-foreground"
                      aria-label={`Fjern ${i.name} fra basisvarerne`}
                      onClick={() => {
                        if (!confirm(`Fjern ${i.name} fra basisvarerne? Ingrediensen bliver i kataloget.`)) return;
                        void run(() => updateIngredient(i.id, { is_staple: false, in_stock: true }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
