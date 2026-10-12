import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useIngredients } from "@/lib/queries";
import { createIngredient } from "@/lib/mutations";
import { UNITS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/lib/types";

/**
 * Vælg en ingrediens fra kataloget — eller opret en ny med kategori,
 * så den automatisk havner rigtigt på indkøbslisten.
 */
export function IngredientPicker({
  value,
  onChange,
  suggestion,
  className,
}: {
  value: string | null;
  onChange: (ingredient: Ingredient) => void;
  /** Forslag til søgetekst/nyt navn, fx fra en importeret linje */
  suggestion?: string;
  className?: string;
}) {
  const { data: ingredients = [] } = useIngredients();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const selected = ingredients.find((i) => i.id === value) ?? null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients.slice(0, 60);
    const starts = ingredients.filter((i) => i.name.toLowerCase().startsWith(q));
    const contains = ingredients.filter(
      (i) => !i.name.toLowerCase().startsWith(q) && i.name.toLowerCase().includes(q),
    );
    return [...starts, ...contains].slice(0, 60);
  }, [ingredients, query]);

  const exact = ingredients.some((i) => i.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setQuery(selected ? "" : (suggestion ?? ""));
          setCreating(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between bg-card font-normal",
            !selected && "text-muted-foreground",
            !selected && suggestion && "border-destructive/60",
            className,
          )}
        >
          <span className="truncate">
            {selected?.name ?? (suggestion ? `Vælg: ${suggestion}` : "Vælg ingrediens…")}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0" align="start">
        {creating ? (
          <CreateIngredientForm
            initialName={query.trim()}
            onCancel={() => setCreating(false)}
            onCreated={(ing) => {
              onChange(ing);
              setOpen(false);
            }}
          />
        ) : (
          <Command shouldFilter={false}>
            <CommandInput placeholder="Søg ingrediens…" value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>Ingen ingrediens fundet.</CommandEmpty>
              {query.trim() && !exact && (
                <CommandGroup>
                  <CommandItem value="__create__" onSelect={() => setCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Opret “{query.trim()}”
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {results.map((i) => (
                  <CommandItem
                    key={i.id}
                    value={i.id}
                    onSelect={() => {
                      onChange(i);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", value === i.id ? "opacity-100" : "opacity-0")}
                    />
                    {i.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function CreateIngredientForm({
  initialName,
  onCreated,
  onCancel,
  noun = "ingrediens",
}: {
  initialName: string;
  /** "ingrediens" i opskrifter, "vare" i admin og på indkøbslisten */
  noun?: "ingrediens" | "vare";
  onCreated: (ing: Ingredient) => void;
  onCancel: () => void;
}) {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    try {
      const ing = await createIngredient({
        name,
        category_id: categoryId || null,
        default_unit: unit || null,
      });
      await qc.invalidateQueries({ queryKey: ["ingredients"] });
      toast.success(`“${ing.name}” oprettet`);
      onCreated(ing);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 p-3">
      <p className="text-sm font-medium">Ny {noun}</p>
      <div className="space-y-1">
        <Label className="text-xs">Navn</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>
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
      <div className="space-y-1">
        <Label className="text-xs">Standardenhed (valgfri)</Label>
        <Select value={unit || "none"} onValueChange={(v) => setUnit(v === "none" ? "" : v)}>
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
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Tilbage
        </Button>
        <Button type="button" size="sm" onClick={submit} disabled={busy || !name.trim()}>
          Opret
        </Button>
      </div>
    </div>
  );
}
