import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  ImagePlus,
  Loader2,
  Plus,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IngredientPicker } from "@/components/app/ingredient-picker";
import { TagChips } from "@/components/app/tag-filter";
import { RecipeImage } from "@/components/app/recipe-image";
import { useIngredients } from "@/lib/queries";
import {
  removeStoredImage,
  saveRecipe,
  uploadRecipeImage,
  type RecipeDraft,
} from "@/lib/mutations";
import { amountToInput, parseAmount, UNITS } from "@/lib/format";
import { matchIngredient, parseIngredientLine, type ParsedIngredientLine } from "@/lib/ingredient-parser";
import type { Ingredient, RecipeDetail } from "@/lib/types";

// ─── Formularens interne tilstand ──────────────────────────────────────────

type IngRow = {
  key: string;
  ingredient_id: string | null;
  amount: string;
  unit: string;
  note: string;
  /** Oprindelig tekst/navn fra import — vises når ingrediensen mangler at blive valgt */
  hint?: string;
};

type StepRow = { key: string; text: string; timer: string };

export type RecipeFormInitial = {
  title: string;
  description: string;
  servings: number;
  prep_minutes: number | null;
  image_url: string | null;
  source_url: string;
  tag_ids: string[];
  ingredients: IngRow[];
  steps: StepRow[];
};

const key = () => Math.random().toString(36).slice(2);

export function emptyInitial(defaultServings = 4): RecipeFormInitial {
  return {
    title: "",
    description: "",
    servings: defaultServings,
    prep_minutes: null,
    image_url: null,
    source_url: "",
    tag_ids: [],
    ingredients: [{ key: key(), ingredient_id: null, amount: "", unit: "", note: "" }],
    steps: [{ key: key(), text: "", timer: "" }],
  };
}

export function initialFromRecipe(r: RecipeDetail): RecipeFormInitial {
  return {
    title: r.title,
    description: r.description ?? "",
    servings: r.servings,
    prep_minutes: r.prep_minutes,
    image_url: r.image_url,
    source_url: r.source_url ?? "",
    tag_ids: r.tag_ids,
    ingredients: r.ingredients.map((i) => ({
      key: key(),
      ingredient_id: i.ingredient_id,
      amount: amountToInput(i.amount),
      unit: i.unit ?? "",
      note: i.note ?? "",
    })),
    steps: r.steps.map((s) => ({
      key: key(),
      text: s.text,
      timer: s.timer_minutes ? String(s.timer_minutes) : "",
    })),
  };
}

/** Lav formularrækker af fortolkede ingredienslinjer og match mod kataloget. */
export function rowsFromParsed(lines: ParsedIngredientLine[], catalog: Ingredient[]): IngRow[] {
  return lines
    .filter((l) => l.name)
    .map((l) => {
      const match = matchIngredient(l.name, catalog);
      return {
        key: key(),
        ingredient_id: match?.id ?? null,
        amount: amountToInput(l.amount),
        unit: l.unit ?? (match?.default_unit && l.amount != null ? match.default_unit : ""),
        note: l.note ?? "",
        hint: l.name,
      };
    });
}

export function stepsFromTexts(texts: string[]): StepRow[] {
  return texts.map((t) => {
    // Find en tid i trinet ("bag i 25 minutter") som forslag til timer
    const m = t.match(/(\d+)\s*(?:-\s*\d+\s*)?(?:min\b|minutter|minut)/i);
    return { key: key(), text: t, timer: m ? m[1] : "" };
  });
}

// ─── Formular ───────────────────────────────────────────────────────────────

export function RecipeForm({
  initial,
  recipeId,
  onSaved,
  onCancel,
  extraActions,
}: {
  initial: RecipeFormInitial;
  recipeId?: string;
  onSaved: (id: string) => void;
  onCancel: () => void;
  extraActions?: React.ReactNode;
}) {
  const qc = useQueryClient();
  const { data: catalog = [] } = useIngredients();

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [servings, setServings] = useState(String(initial.servings));
  const [prep, setPrep] = useState(initial.prep_minutes ? String(initial.prep_minutes) : "");
  const [imageUrl, setImageUrl] = useState(initial.image_url);
  const [sourceUrl, setSourceUrl] = useState(initial.source_url);
  const [tagIds, setTagIds] = useState(initial.tag_ids);
  const [ings, setIngs] = useState<IngRow[]>(initial.ingredients);
  const [steps, setSteps] = useState<StepRow[]>(initial.steps);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─ Ingredienser
  const updateIng = (k: string, patch: Partial<IngRow>) =>
    setIngs((rows) => rows.map((r) => (r.key === k ? { ...r, ...patch } : r)));
  const moveIng = (k: string, dir: -1 | 1) =>
    setIngs((rows) => move(rows, rows.findIndex((r) => r.key === k), dir));
  const removeIng = (k: string) => setIngs((rows) => rows.filter((r) => r.key !== k));
  const addIng = () =>
    setIngs((rows) => [...rows, { key: key(), ingredient_id: null, amount: "", unit: "", note: "" }]);

  // ─ Trin
  const updateStep = (k: string, patch: Partial<StepRow>) =>
    setSteps((rows) => rows.map((r) => (r.key === k ? { ...r, ...patch } : r)));
  const moveStep = (k: string, dir: -1 | 1) =>
    setSteps((rows) => move(rows, rows.findIndex((r) => r.key === k), dir));
  const removeStep = (k: string) => setSteps((rows) => rows.filter((r) => r.key !== k));
  const addStep = () => setSteps((rows) => [...rows, { key: key(), text: "", timer: "" }]);

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      setImageUrl(await uploadRecipeImage(file));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Opskriften skal have en titel.");
    const s = Number(servings);
    if (!Number.isInteger(s) || s < 1 || s > 50) {
      return toast.error("Antal personer skal være mellem 1 og 50.");
    }
    const prepMin = prep.trim() ? Number(prep) : null;
    if (prepMin != null && (!Number.isFinite(prepMin) || prepMin < 0)) {
      return toast.error("Tilberedningstid skal være et antal minutter.");
    }

    const filled = ings.filter((r) => r.ingredient_id || r.amount || r.note || r.hint);
    const missing = filled.filter((r) => !r.ingredient_id);
    if (missing.length) {
      return toast.error(
        `Vælg ingrediens for: ${missing.map((m) => m.hint || m.note || "tom linje").join(", ")}`,
      );
    }
    for (const r of filled) {
      if (r.amount.trim() && parseAmount(r.amount) == null) {
        return toast.error(`Ugyldig mængde: “${r.amount}”`);
      }
    }

    const draft: RecipeDraft = {
      title,
      description,
      servings: s,
      prep_minutes: prepMin == null ? null : Math.round(prepMin),
      image_url: imageUrl,
      source_url: sourceUrl,
      tag_ids: tagIds,
      ingredients: filled.map((r) => ({
        ingredient_id: r.ingredient_id!,
        amount: r.amount.trim() ? parseAmount(r.amount) : null,
        unit: r.unit || null,
        note: r.note || null,
      })),
      steps: steps.map((st) => ({
        text: st.text,
        timer_minutes: st.timer.trim() ? Math.max(1, Math.round(Number(st.timer))) || null : null,
      })),
    };

    setSaving(true);
    try {
      const id = await saveRecipe(draft, recipeId);
      // Ryd op i et udskiftet billede, så storage ikke fyldes med gamle filer
      if (initial.image_url && initial.image_url !== imageUrl) {
        await removeStoredImage(initial.image_url).catch(() => undefined);
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["recipes"] }),
        qc.invalidateQueries({ queryKey: ["recipe", id] }),
      ]);
      toast.success("Opskrift gemt");
      onSaved(id);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Billede */}
      <Card className="overflow-hidden">
        <div className="relative aspect-[16/9] w-full bg-muted">
          <RecipeImage src={imageUrl} alt={title || "Opskrift"} />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickImage(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus className="mr-1 h-4 w-4" />
            {imageUrl ? "Skift billede" : "Tilføj billede"}
          </Button>
          {imageUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
              <X className="mr-1 h-4 w-4" />
              Fjern billede
            </Button>
          )}
        </div>
      </Card>

      {/* Grundoplysninger */}
      <Card className="space-y-4 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Titel</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Beskrivelse</Label>
          <Textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kort beskrivelse af retten (valgfri)"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="servings">Antal personer</Label>
            <Input
              id="servings"
              type="number"
              inputMode="numeric"
              min={1}
              max={50}
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prep">Tid i alt (min)</Label>
            <Input
              id="prep"
              type="number"
              inputMode="numeric"
              min={0}
              value={prep}
              onChange={(e) => setPrep(e.target.value)}
              placeholder="fx 45"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source">Kilde (link)</Label>
          <Input
            id="source"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
      </Card>

      {/* Tags */}
      <Card className="space-y-3 p-4">
        <div>
          <h2 className="font-serif text-xl">Tags</h2>
          <p className="text-xs text-muted-foreground">
            Bruges til søgning og i ugeplanen — “Weekendmad” foretrækkes fredag og lørdag, og
            hovedingrediensen bruges til at variere ugen.
          </p>
        </div>
        <TagChips
          selected={tagIds}
          onToggle={(id) =>
            setTagIds((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))
          }
        />
      </Card>

      {/* Ingredienser */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-xl">Ingredienser</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPasteOpen(true)}>
            <ClipboardPaste className="mr-1 h-4 w-4" />
            Indsæt liste
          </Button>
        </div>
        <ul className="space-y-3">
          {ings.map((r, idx) => (
            <li key={r.key} className="space-y-2 rounded-lg border border-border/70 p-2.5">
              <div className="flex items-center gap-1.5">
                <IngredientPicker
                  value={r.ingredient_id}
                  suggestion={r.hint}
                  onChange={(ing) =>
                    updateIng(r.key, {
                      ingredient_id: ing.id,
                      unit: r.unit || ing.default_unit || "",
                    })
                  }
                />
                <RowButtons
                  first={idx === 0}
                  last={idx === ings.length - 1}
                  onUp={() => moveIng(r.key, -1)}
                  onDown={() => moveIng(r.key, 1)}
                  onRemove={() => removeIng(r.key)}
                />
              </div>
              <div className="flex gap-1.5">
                <Input
                  aria-label="Mængde"
                  inputMode="decimal"
                  className="w-20 shrink-0"
                  placeholder="Mængde"
                  value={r.amount}
                  onChange={(e) => updateIng(r.key, { amount: e.target.value })}
                />
                <UnitSelect value={r.unit} onChange={(unit) => updateIng(r.key, { unit })} />
                <Input
                  aria-label="Note"
                  className="min-w-0 flex-1"
                  placeholder="Note, fx finthakket"
                  value={r.note}
                  onChange={(e) => updateIng(r.key, { note: e.target.value })}
                />
              </div>
              {r.hint && !r.ingredient_id && (
                <p className="text-xs text-destructive">
                  “{r.hint}” findes ikke i ingredienslisten — vælg den eller opret den.
                </p>
              )}
            </li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" onClick={addIng}>
          <Plus className="mr-1 h-4 w-4" />
          Tilføj ingrediens
        </Button>
      </Card>

      {/* Fremgangsmåde */}
      <Card className="space-y-3 p-4">
        <h2 className="font-serif text-xl">Fremgangsmåde</h2>
        <ol className="space-y-3">
          {steps.map((s, idx) => (
            <li key={s.key} className="flex gap-2">
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-1.5">
                <Textarea
                  rows={2}
                  value={s.text}
                  onChange={(e) => updateStep(s.key, { text: e.target.value })}
                  placeholder={`Trin ${idx + 1}`}
                />
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <Input
                    aria-label="Timer i minutter"
                    inputMode="numeric"
                    className="h-8 w-20"
                    placeholder="min"
                    value={s.timer}
                    onChange={(e) =>
                      updateStep(s.key, { timer: e.target.value.replace(/[^0-9]/g, "") })
                    }
                  />
                  <span className="text-xs text-muted-foreground">timer (valgfri)</span>
                  <div className="ml-auto">
                    <RowButtons
                      first={idx === 0}
                      last={idx === steps.length - 1}
                      onUp={() => moveStep(s.key, -1)}
                      onDown={() => moveStep(s.key, 1)}
                      onRemove={() => removeStep(s.key)}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <Button type="button" variant="outline" size="sm" onClick={addStep}>
          <Plus className="mr-1 h-4 w-4" />
          Tilføj trin
        </Button>
      </Card>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 px-4 py-3 pb-safe backdrop-blur">
        {extraActions}
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annullér
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Gemmer…" : "Gem opskrift"}
          </Button>
        </div>
      </div>

      <PasteIngredientsDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        onAdd={(lines) => {
          const rows = rowsFromParsed(lines, catalog);
          setIngs((cur) => [
            ...cur.filter((r) => r.ingredient_id || r.amount || r.note || r.hint),
            ...rows,
          ]);
        }}
      />
    </form>
  );
}

function move<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const to = idx + dir;
  if (idx < 0 || to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  [copy[idx], copy[to]] = [copy[to], copy[idx]];
  return copy;
}

function RowButtons({
  first,
  last,
  onUp,
  onDown,
  onRemove,
}: {
  first: boolean;
  last: boolean;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0">
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={first} onClick={onUp} aria-label="Flyt op">
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" disabled={last} onClick={onDown} aria-label="Flyt ned">
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onRemove} aria-label="Fjern">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function UnitSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options: string[] = [...UNITS];
  if (value && !options.includes(value)) options.unshift(value);
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
      <SelectTrigger aria-label="Enhed" className="w-24 shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">–</SelectItem>
        {options.map((u) => (
          <SelectItem key={u} value={u}>
            {u}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PasteIngredientsDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (lines: ParsedIngredientLine[]) => void;
}) {
  const [text, setText] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Indsæt ingrediensliste</DialogTitle>
          <DialogDescription>
            Én ingrediens pr. linje, fx “2 spsk olivenolie” eller “500 g hakket oksekød”. Mængde og
            enhed findes automatisk.
          </DialogDescription>
        </DialogHeader>
        <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} />
        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              const lines = text
                .split(/\n+/)
                .map((l) => l.trim())
                .filter(Boolean)
                .map(parseIngredientLine);
              onAdd(lines);
              setText("");
              onOpenChange(false);
            }}
            disabled={!text.trim()}
          >
            Tilføj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
