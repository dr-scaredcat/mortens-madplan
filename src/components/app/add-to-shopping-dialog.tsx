import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories, useIngredients, useShoppingItems } from "@/lib/queries";
import { addShoppingItems, type ShoppingInput } from "@/lib/mutations";
import { formatQuantity, scaleAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Ingredient, RecipeIngredient } from "@/lib/types";

/** En opskrift der skal på indkøbslisten, med det ønskede antal personer. */
export type ShoppingSource = {
  title: string;
  /** Opskriftens eget antal personer */
  recipeServings: number;
  /** Antal personer der skal købes ind til */
  servings: number;
  ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
};

type Row = {
  key: string;
  ingredient: Ingredient;
  unit: string | null;
  amount: number | null;
  sources: string[];
  notes: string[];
  selected: boolean;
};

/**
 * Vælg hvilke ingredienser fra en eller flere opskrifter der skal på
 * indkøbslisten. Alt er valgt, undtagen basisvarer der står som "har vi" i
 * varelageret. Basisvarer der er "løbet tør" er valgt. Alt kan til- og fravælges.
 */
export function AddToShoppingDialog({
  open,
  onOpenChange,
  sources,
  title = "Til indkøbslisten",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sources: ShoppingSource[];
  title?: string;
}) {
  const qc = useQueryClient();
  const { data: catalog = [] } = useIngredients();
  const { data: categories = [] } = useCategories();
  const { data: shopping = [] } = useShoppingItems();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  // Byg rækkerne når dialogen åbnes. Brug katalogets aktuelle lagerstatus.
  const freshCatalog = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);
  useEffect(() => {
    if (!open) return;
    const map = new Map<string, Row>();
    for (const src of sources) {
      for (const ri of src.ingredients) {
        const ing = freshCatalog.get(ri.ingredient_id) ?? ri.ingredient;
        const unit = ri.unit?.trim() || null;
        const amount = scaleAmount(ri.amount, src.recipeServings, src.servings);
        const key = `${ing.id}|${unit ?? ""}|${amount == null ? "n" : "a"}`;
        const existing = map.get(key);
        if (existing) {
          if (amount != null) existing.amount = (existing.amount ?? 0) + amount;
          if (!existing.sources.includes(src.title)) existing.sources.push(src.title);
          if (ri.note && !existing.notes.includes(ri.note)) existing.notes.push(ri.note);
        } else {
          map.set(key, {
            key,
            ingredient: ing,
            unit,
            amount,
            sources: [src.title],
            notes: ri.note ? [ri.note] : [],
            selected: !(ing.is_staple && ing.in_stock),
          });
        }
      }
    }
    setRows([...map.values()]);
    // Kun når dialogen åbnes — ikke ved hver katalogopdatering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onList = useMemo(
    () => new Set(shopping.filter((s) => !s.checked && s.ingredient_id).map((s) => s.ingredient_id!)),
    [shopping],
  );

  const catOrder = useMemo(
    () => new Map(categories.map((c, i) => [c.id, i])),
    [categories],
  );
  const sorted = [...rows].sort(
    (a, b) =>
      (catOrder.get(a.ingredient.category_id ?? "") ?? 999) -
        (catOrder.get(b.ingredient.category_id ?? "") ?? 999) ||
      a.ingredient.name.localeCompare(b.ingredient.name, "da"),
  );
  const selectedCount = rows.filter((r) => r.selected).length;

  const toggle = (key: string, v: boolean) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, selected: v } : r)));

  async function submit() {
    const items: ShoppingInput[] = rows
      .filter((r) => r.selected)
      .map((r) => ({
        ingredient_id: r.ingredient.id,
        amount: r.amount == null ? null : Math.round(r.amount * 100) / 100,
        unit: r.unit,
        source: r.sources.join(", "),
      }));
    setBusy(true);
    try {
      const n = await addShoppingItems(items);
      await qc.invalidateQueries({ queryKey: ["shopping"] });
      toast.success(`${n} vare${n === 1 ? "" : "r"} lagt på indkøbslisten`);
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="flex max-h-[90dvh] flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fravælg det, I allerede har. Basisvarer fra varelageret er fravalgt, medmindre de er
            løbet tør.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-2 flex items-center gap-2 px-2 text-xs">
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => setRows((rs) => rs.map((r) => ({ ...r, selected: true })))}
          >
            Vælg alle
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => setRows((rs) => rs.map((r) => ({ ...r, selected: false })))}
          >
            Fravælg alle
          </button>
        </div>

        <ul className="-mx-2 flex-1 divide-y divide-border overflow-y-auto">
          {sorted.map((r) => (
            <li key={r.key}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-2 py-2.5",
                  !r.selected && "text-muted-foreground",
                )}
              >
                <Checkbox checked={r.selected} onCheckedChange={(v) => toggle(r.key, v === true)} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className={cn(!r.selected && "line-through")}>{r.ingredient.name}</span>
                    {r.ingredient.is_staple &&
                      (r.ingredient.in_stock ? (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                          På lager
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-normal">
                          Løbet tør
                        </Badge>
                      ))}
                    {onList.has(r.ingredient.id) && (
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                        Står på listen
                      </Badge>
                    )}
                  </span>
                  {sources.length > 1 && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.sources.join(", ")}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatQuantity(r.amount, r.unit)}
                </span>
              </label>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              Ingen ingredienser.
            </li>
          )}
        </ul>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Annullér
          </Button>
          <Button onClick={submit} disabled={busy || selectedCount === 0}>
            <ShoppingCart className="mr-1 h-4 w-4" />
            Tilføj {selectedCount} vare{selectedCount === 1 ? "" : "r"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
