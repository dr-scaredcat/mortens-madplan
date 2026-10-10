import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreateIngredientForm } from "@/components/app/ingredient-picker";
import { supabase, unwrap } from "@/lib/supabase";
import { useCategories, useIngredients } from "@/lib/queries";
import { UNITS } from "@/lib/format";
import type { Ingredient } from "@/lib/types";

/**
 * Ingredienskataloget. Kategorien bestemmer, hvor varen havner på
 * indkøbslisten; "Basisvare" betyder at den registreres i varelageret.
 */
export function AdminIngredients() {
  const qc = useQueryClient();
  const { data: ingredients = [], isLoading } = useIngredients();
  const { data: categories = [] } = useCategories();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ingredients.filter(
      (i) =>
        (!needle || i.name.toLowerCase().includes(needle)) &&
        (cat === "all" || (cat === "none" ? !i.category_id : i.category_id === cat)),
    );
  }, [ingredients, q, cat]);

  async function update(i: Ingredient, patch: Partial<Ingredient>) {
    // Optimistisk opdatering, så listen føles hurtig
    qc.setQueryData<Ingredient[]>(["ingredients"], (old) =>
      old?.map((x) => (x.id === i.id ? { ...x, ...patch } : x)),
    );
    try {
      unwrap(await supabase.from("ingredients").update(patch).eq("id", i.id));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      await qc.invalidateQueries({ queryKey: ["ingredients"] });
    }
  }

  async function remove(i: Ingredient) {
    if (!confirm(`Slet “${i.name}”?`)) return;
    try {
      unwrap(await supabase.from("ingredients").delete().eq("id", i.id));
      await qc.invalidateQueries({ queryKey: ["ingredients"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Ingredienser</h2>
          <p className="text-sm text-muted-foreground">
            {ingredients.length} ingredienser. “Basisvare” vises i varelageret.
          </p>
        </div>
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Ny
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <CreateIngredientForm
              initialName=""
              onCancel={() => setAddOpen(false)}
              onCreated={() => setAddOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg…" className="pl-9" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle kategorier</SelectItem>
            <SelectItem value="none">Uden kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Indlæser…</p>
      ) : (
        <Card className="divide-y divide-border">
          {list.map((i) => (
            <div key={i.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
              <Input
                defaultValue={i.name}
                className="h-9 min-w-40 flex-1"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== i.name) void update(i, { name: v });
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              />
              <Select
                value={i.category_id ?? "none"}
                onValueChange={(v) => update(i, { category_id: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={i.default_unit ?? "none"}
                onValueChange={(v) => update(i, { default_unit: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-9 w-24" aria-label="Standardenhed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">–</SelectItem>
                  {[...new Set([...(i.default_unit ? [i.default_unit] : []), ...UNITS])].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Switch
                  checked={i.is_staple}
                  onCheckedChange={(v) => update(i, { is_staple: v, in_stock: true })}
                />
                Basisvare
              </label>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(i)}
                aria-label={`Slet ${i.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {list.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Ingen matcher.</p>
          )}
        </Card>
      )}
    </div>
  );
}
