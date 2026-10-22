import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FindOfferButton } from "@/components/app/find-offer";
import { useRealtimeInvalidate } from "@/hooks/use-realtime";
import { useCategories, useIngredients, useShoppingItems } from "@/lib/queries";
import {
  addShoppingItems,
  clearAllShopping,
  clearCheckedShopping,
  createIngredient,
  deleteShoppingItem,
  setShoppingChecked,
  updateIngredient,
  updateShoppingItem,
} from "@/lib/mutations";
import { amountToInput, formatQuantity, parseAmount, UNITS } from "@/lib/format";
import { parseIngredientLine } from "@/lib/ingredient-parser";
import { cn } from "@/lib/utils";
import type { Ingredient, ShoppingItem } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/indkoebsliste")({
  head: () => ({ meta: [{ title: "Indkøbsliste — Astons Køkken" }] }),
  component: ShoppingPage,
});

const NO_CATEGORY = "__none__";

function ShoppingPage() {
  const qc = useQueryClient();
  const { data: items = [], isLoading, error } = useShoppingItems();
  const { data: categories = [] } = useCategories();
  useRealtimeInvalidate("shopping_items", [["shopping"]]);
  useRealtimeInvalidate("ingredients", [["ingredients"]]);

  const [editing, setEditing] = useState<ShoppingItem | null>(null);
  const [showChecked, setShowChecked] = useState(true);

  const groups = useMemo(() => {
    const byCat = new Map<string, ShoppingItem[]>();
    for (const it of items) {
      const k = it.category_id ?? NO_CATEGORY;
      byCat.set(k, [...(byCat.get(k) ?? []), it]);
    }
    const ordered = [
      ...categories.map((c) => ({ id: c.id, name: c.name })),
      { id: NO_CATEGORY, name: "Uden kategori" },
    ];
    return ordered
      .map((c) => ({
        ...c,
        open: (byCat.get(c.id) ?? [])
          .filter((i) => !i.checked)
          .sort((a, b) => a.name.localeCompare(b.name, "da")),
        done: (byCat.get(c.id) ?? []).filter((i) => i.checked),
      }))
      .filter((g) => g.open.length > 0 || g.done.length > 0);
  }, [items, categories]);

  const openCount = items.filter((i) => !i.checked).length;
  const doneCount = items.length - openCount;

  async function toggle(item: ShoppingItem, checked: boolean) {
    // Optimistisk, så afkrydsning føles øjeblikkelig i butikken
    qc.setQueryData<ShoppingItem[]>(["shopping"], (old) =>
      old?.map((i) => (i.id === item.id ? { ...i, checked } : i)),
    );
    try {
      await setShoppingChecked(item.id, checked);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      void qc.invalidateQueries({ queryKey: ["shopping"] });
      if (checked && item.ingredient_id) void qc.invalidateQueries({ queryKey: ["ingredients"] });
    }
  }

  async function run(fn: () => Promise<unknown>, msg?: string) {
    try {
      await fn();
      await qc.invalidateQueries({ queryKey: ["shopping"] });
      if (msg) toast.success(msg);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-safe">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Indkøbsliste</h1>
          <p className="text-sm text-muted-foreground">
            {openCount} tilbage{doneCount ? ` · ${doneCount} i kurven` : ""}
          </p>
        </div>
      </div>

      <AddItemBar />

      {error ? (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {(error as Error).message}
        </div>
      ) : isLoading ? (
        <p className="mt-6 text-muted-foreground">Indlæser…</p>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Listen er tom. Tilføj varer ovenfor — eller fra en opskrift med “Til indkøbslisten”.
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {groups.map((g) => {
            const visibleDone = showChecked ? g.done : [];
            if (g.open.length === 0 && visibleDone.length === 0) return null;
            return (
              <section key={g.id}>
                <h2 className="heading-sm mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.name}
                </h2>
                <Card className="divide-y divide-border">
                  {[...g.open, ...visibleDone].map((it) => (
                    <ItemRow
                      key={it.id}
                      item={it}
                      onToggle={(v) => toggle(it, v)}
                      onEdit={() => setEditing(it)}
                    />
                  ))}
                </Card>
              </section>
            );
          })}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {doneCount > 0 && (
              <>
                <Button
                  variant="outline"
                  className="bg-card"
                  onClick={() => run(clearCheckedShopping, "Afkrydsede varer fjernet")}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Ryd afkrydsede ({doneCount})
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowChecked((v) => !v)}>
                  <ChevronDown
                    className={cn("mr-1 h-4 w-4 transition", !showChecked && "-rotate-90")}
                  />
                  {showChecked ? "Skjul afkrydsede" : "Vis afkrydsede"}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (confirm("Tøm hele indkøbslisten?")) void run(clearAllShopping, "Listen er tømt");
              }}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Tøm listen
            </Button>
          </div>
        </div>
      )}

      <EditItemDialog item={editing} onClose={() => setEditing(null)} />
    </main>
  );
}

function ItemRow({
  item,
  onToggle,
  onEdit,
}: {
  item: ShoppingItem;
  onToggle: (v: boolean) => void;
  onEdit: () => void;
}) {
  const qty = formatQuantity(item.amount, item.unit);
  return (
    <div className="flex items-center gap-3 px-3 py-1">
      <Checkbox
        checked={item.checked}
        onCheckedChange={(v) => onToggle(v === true)}
        className="h-6 w-6"
        aria-label={`Afkryds ${item.name}`}
      />
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          "flex min-w-0 flex-1 items-baseline gap-2 py-2 text-left",
          item.checked && "text-muted-foreground line-through",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate">{item.name}</span>
          {item.sources.length > 0 && !item.checked && (
            <span className="block truncate text-xs text-muted-foreground no-underline">
              {item.sources.join(" · ")}
            </span>
          )}
        </span>
        {qty && <span className="shrink-0 text-sm text-muted-foreground">{qty}</span>}
      </button>
      {!item.checked && <FindOfferButton name={item.name} />}
    </div>
  );
}

type Draft = { name: string; amount: number | null; unit: string | null; ingredient: Ingredient | null };

/**
 * Tilføj en vare. Tekst som "2 l mælk" deles automatisk op i mængde, enhed og
 * navn. Derefter åbner et vindue, hvor mængden kan rettes – og hvis varen ikke
 * findes i ingredienskataloget, kan den oprettes med kategori og standardenhed.
 */
function AddItemBar() {
  const { data: catalog = [] } = useIngredients();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const needle = parseIngredientLine(text).name.toLowerCase();
  const suggestions =
    needle.length >= 2
      ? catalog.filter((c) => c.name.toLowerCase().startsWith(needle)).slice(0, 5)
      : [];

  function open(raw: string, picked?: Ingredient) {
    const line = raw.trim();
    if (!line && !picked) return;
    const p = parseIngredientLine(line);
    const name = picked?.name ?? (p.name || line);
    const ingredient =
      picked ?? catalog.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? null;
    setDraft({ name, amount: p.amount, unit: p.unit, ingredient });
  }

  return (
    <div className="sticky top-12 z-20 -mx-4 bg-background/95 px-4 py-2 backdrop-blur">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          open(text);
        }}
        className="flex gap-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tilføj vare, fx “2 l mælk” eller “opvaskemiddel”"
          className="bg-card"
          enterKeyHint="done"
          autoComplete="off"
        />
        <Button type="submit" disabled={!text.trim()} aria-label="Tilføj">
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      {suggestions.length > 0 && (
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => open(text, s)}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-primary/50"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <AddItemDialog
        draft={draft}
        onClose={() => setDraft(null)}
        onAdded={() => {
          setDraft(null);
          setText("");
        }}
      />
    </div>
  );
}

/**
 * Vinduet der vises, når en vare tilføjes manuelt: mængde og enhed – og for
 * nye varer også kategori og standardenhed, så de kan gemmes som vare.
 */
function AddItemDialog({
  draft,
  onClose,
  onAdded,
}: {
  draft: Draft | null;
  onClose: () => void;
  onAdded: () => void;
}) {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: catalog = [] } = useIngredients();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [defaultUnit, setDefaultUnit] = useState("");
  const [saveIngredient, setSaveIngredient] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lastDraft, setLastDraft] = useState<Draft | null>(null);

  // Nulstil felterne, når vinduet åbnes med en ny vare
  if (draft && draft !== lastDraft) {
    setLastDraft(draft);
    setName(draft.name);
    setAmount(amountToInput(draft.amount));
    setUnit(draft.unit ?? (draft.amount != null ? (draft.ingredient?.default_unit ?? "") : ""));
    setCategoryId("");
    setDefaultUnit(draft.unit ?? "");
    setSaveIngredient(true);
  }

  // Findes navnet (evt. rettet) i kataloget?
  const ingredient =
    catalog.find((c) => c.name.toLowerCase() === name.trim().toLowerCase()) ?? null;
  const isNew = !ingredient && name.trim().length > 0;

  async function submit() {
    const n = name.trim();
    if (!n) return;
    const amt = amount.trim() ? parseAmount(amount) : null;
    if (amount.trim() && amt == null) return toast.error("Ugyldig mængde");
    if (isNew && saveIngredient && !categoryId) return toast.error("Vælg en kategori");
    setBusy(true);
    try {
      let ingredientId = ingredient?.id ?? null;
      if (isNew && saveIngredient) {
        const ing = await createIngredient({
          name: n,
          category_id: categoryId || null,
          default_unit: defaultUnit || null,
        });
        ingredientId = ing.id;
        await qc.invalidateQueries({ queryKey: ["ingredients"] });
        toast.success(`“${ing.name}” er oprettet som vare`);
      }
      await addShoppingItems([
        {
          ingredient_id: ingredientId,
          name: n,
          amount: amt,
          // Uden valgt enhed bruges ingrediensens standardenhed
          unit: amt != null ? unit || ingredient?.default_unit || (isNew ? defaultUnit : "") || null : null,
          category_id: isNew ? categoryId || null : (ingredient?.category_id ?? null),
          source: null,
        },
      ]);
      await qc.invalidateQueries({ queryKey: ["shopping"] });
      onAdded();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? "Ny vare" : "Tilføj vare"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Vare</Label>
            <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="w-28 space-y-1.5">
              <Label htmlFor="add-amount">Mængde</Label>
              <Input
                id="add-amount"
                inputMode="decimal"
                value={amount}
                placeholder="valgfri"
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label>Enhed</Label>
              <Select value={unit || "none"} onValueChange={(v) => setUnit(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">–</SelectItem>
                  {[...new Set([...(unit ? [unit] : []), ...UNITS])].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isNew && (
            <div className="space-y-3 rounded-md border border-dashed border-border p-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={saveIngredient}
                  onCheckedChange={(v) => setSaveIngredient(v === true)}
                />
                Opret “{name.trim()}” som vare
              </label>
              <div className="space-y-1">
                <Label className="text-xs">Kategori på indkøbslisten</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {saveIngredient && (
                <div className="space-y-1">
                  <Label className="text-xs">Standardenhed (valgfri)</Label>
                  <Select
                    value={defaultUnit || "none"}
                    onValueChange={(v) => setDefaultUnit(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen</SelectItem>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Annullér
            </Button>
            <Button type="submit" disabled={busy || !name.trim()}>
              Tilføj til listen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditItemDialog({ item, onClose }: { item: ShoppingItem | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [categoryId, setCategoryId] = useState(NO_CATEGORY);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  // Nulstil felterne når en ny vare åbnes
  if (item && item.id !== lastId) {
    setLastId(item.id);
    setName(item.name);
    setAmount(amountToInput(item.amount));
    setUnit(item.unit ?? "");
    setCategoryId(item.category_id ?? NO_CATEGORY);
    setRemember(true);
  }

  const categoryChanged = item && (item.category_id ?? NO_CATEGORY) !== categoryId;

  async function save() {
    if (!item) return;
    const amt = amount.trim() ? parseAmount(amount) : null;
    if (amount.trim() && amt == null) return toast.error("Ugyldig mængde");
    const cat = categoryId === NO_CATEGORY ? null : categoryId;
    setBusy(true);
    try {
      let ingredientId = item.ingredient_id;
      // Husk kategorien til næste gang: på ingrediensen, eller ved at oprette den
      if (categoryChanged && remember && cat) {
        if (ingredientId) {
          await updateIngredient(ingredientId, { category_id: cat });
        } else {
          const ing = await createIngredient({ name: name.trim(), category_id: cat, default_unit: null });
          ingredientId = ing.id;
        }
        await qc.invalidateQueries({ queryKey: ["ingredients"] });
      }
      await updateShoppingItem(item.id, {
        name: name.trim() || item.name,
        amount: amt,
        unit: unit || null,
        category_id: cat,
        ingredient_id: ingredientId,
      });
      await qc.invalidateQueries({ queryKey: ["shopping"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!item) return;
    try {
      await deleteShoppingItem(item.id);
      await qc.invalidateQueries({ queryKey: ["shopping"] });
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redigér vare</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="si-name">Vare</Label>
            <Input id="si-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="w-28 space-y-1.5">
              <Label htmlFor="si-amount">Mængde</Label>
              <Input
                id="si-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label>Enhed</Label>
              <Select value={unit || "none"} onValueChange={(v) => setUnit(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">–</SelectItem>
                  {[...new Set([...(unit ? [unit] : []), ...UNITS])].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Uden kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {categoryChanged && categoryId !== NO_CATEGORY && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Husk kategorien næste gang “{name.trim() || item?.name}” tilføjes
            </label>
          )}
          {item && item.sources.length > 0 && (
            <p className="text-xs text-muted-foreground">Fra: {item.sources.join(", ")}</p>
          )}
          <FindOfferButton name={name || item?.name || ""} withLabel className="-ml-3" />
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" className="text-destructive" onClick={remove} disabled={busy}>
            <Trash2 className="mr-1 h-4 w-4" />
            Fjern
          </Button>
          <Button onClick={save} disabled={busy}>
            Gem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
