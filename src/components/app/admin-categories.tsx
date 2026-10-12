import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase, unwrap } from "@/lib/supabase";
import { useCategories, useIngredients } from "@/lib/queries";
import type { ShopCategory } from "@/lib/types";

/**
 * Butikskategorier. Rækkefølgen her er rækkefølgen på indkøbslisten —
 * sæt dem i den rækkefølge, I går rundt i butikken.
 */
export function AdminCategories() {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: ingredients = [] } = useIngredients();
  const [newName, setNewName] = useState("");

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["categories"] }),
      qc.invalidateQueries({ queryKey: ["ingredients"] }),
    ]);

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function move(idx: number, dir: -1 | 1) {
    const to = idx + dir;
    if (to < 0 || to >= categories.length) return;
    const arr = [...categories];
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    await run(async () => {
      // Skriv fortløbende sort_order for hele listen
      await Promise.all(
        arr.map((c, i) =>
          supabase
            .from("shop_categories")
            .update({ sort_order: (i + 1) * 10 })
            .eq("id", c.id)
            .then(unwrap),
        ),
      );
    });
  }

  async function rename(c: ShopCategory, name: string) {
    if (!name.trim() || name.trim() === c.name) return;
    await run(async () =>
      unwrap(await supabase.from("shop_categories").update({ name: name.trim() }).eq("id", c.id)),
    );
  }

  async function remove(c: ShopCategory) {
    const used = ingredients.filter((i) => i.category_id === c.id).length;
    if (
      !confirm(
        `Slet kategorien “${c.name}”?${used ? ` ${used} vare(r) mister deres kategori.` : ""}`,
      )
    )
      return;
    await run(async () => unwrap(await supabase.from("shop_categories").delete().eq("id", c.id)));
  }

  async function add() {
    if (!newName.trim()) return;
    const max = categories.reduce((m, c) => Math.max(m, c.sort_order), 0);
    await run(async () =>
      unwrap(
        await supabase
          .from("shop_categories")
          .insert({ name: newName.trim(), sort_order: max + 10 }),
      ),
    );
    setNewName("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Kategorier</h2>
        <p className="text-sm text-muted-foreground">
          Rækkefølgen her er rækkefølgen på indkøbslisten — sæt dem efter jeres rute i butikken.
        </p>
      </div>
      <Card className="divide-y divide-border">
        {categories.map((c, idx) => (
          <div key={c.id} className="flex items-center gap-2 px-3 py-2">
            <Input
              defaultValue={c.name}
              className="h-9 flex-1"
              onBlur={(e) => rename(c, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            />
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
              {ingredients.filter((i) => i.category_id === c.id).length}
            </span>
            <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === 0} onClick={() => move(idx, -1)} aria-label="Flyt op">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === categories.length - 1} onClick={() => move(idx, 1)} aria-label="Flyt ned">
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(c)} aria-label="Slet">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </Card>
      <div className="flex gap-2">
        <Input
          placeholder="Ny kategori"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <Button onClick={add} disabled={!newName.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          Tilføj
        </Button>
      </div>
    </div>
  );
}
