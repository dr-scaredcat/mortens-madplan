import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Wine } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWineStyles, useWinesForStyle } from "@/lib/queries";
import { saveRecipeWine } from "@/lib/mutations";
import type { StockWine, WinePlacement, WineStyle } from "@/lib/types";

/**
 * "Vin til retten" — vinkategori og konkrete forslag til en opskrift, plus en
 * knap der viser de vine i vinkøleskabet (Astons Bar), som passer til kategorien.
 * Kategorierne er fælles med Astons Bar (public.wine_styles).
 */

// Samme farver som vinkøleskabet i Astons Bar, så typerne genkendes på tværs.
const TYPE_COLOR: Record<string, string> = {
  rød: "oklch(0.40 0.13 18)",
  hvid: "oklch(0.85 0.12 95)",
  rosé: "oklch(0.84 0.09 20)",
  mousserende: "oklch(0.91 0.08 100)",
  dessertvin: "oklch(0.71 0.13 62)",
};
const BEER_COLOR = "oklch(0.72 0.12 75)";

function typeColor(style: WineStyle | undefined) {
  if (!style) return "var(--muted-foreground)";
  return style.bar_type ? (TYPE_COLOR[style.bar_type] ?? "var(--muted-foreground)") : BEER_COLOR;
}

function TypeDot({ style }: { style: WineStyle | undefined }) {
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
      style={{ background: typeColor(style) }}
    />
  );
}

export function RecipeWine({
  recipeId,
  styleId,
  suggestion,
}: {
  recipeId: string;
  styleId: string | null;
  suggestion: string | null;
}) {
  const { data: styles = [] } = useWineStyles();
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);

  const style = styles.find((s) => s.id === styleId);
  const hasWine = !!styleId || !!suggestion;

  return (
    <section className="mt-8">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-serif text-2xl">Vin til retten</h2>
        {hasWine && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Ret
          </Button>
        )}
      </div>

      {!hasWine ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">Der er ikke noget vinforslag endnu.</p>
          <Button variant="outline" size="sm" className="bg-card" onClick={() => setEditOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Tilføj vinforslag
          </Button>
        </div>
      ) : (
        <Card className="space-y-3 p-4">
          {style && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <TypeDot style={style} />
              <span className="font-medium">{style.wine_label}</span>
              <span className="text-muted-foreground">· {style.style}</span>
            </div>
          )}
          {suggestion && (
            <p className="text-sm leading-relaxed">
              <span className="mr-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Forslag
              </span>
              {suggestion}
            </p>
          )}
          {style?.bar_type && (
            <Button variant="outline" size="sm" className="bg-card" onClick={() => setStockOpen(true)}>
              <Wine className="mr-1 h-4 w-4" />
              Se vine på lager
            </Button>
          )}
        </Card>
      )}

      <WineEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        recipeId={recipeId}
        styleId={styleId}
        suggestion={suggestion}
      />
      {style && (
        <WineStockDialog open={stockOpen} onOpenChange={setStockOpen} style={style} styles={styles} />
      )}
    </section>
  );
}

// ─── Filter på opskriftsoversigten ──────────────────────────────────────────

/**
 * Vinfilter i samme layout som tag-filtrene: én række med vintyper, og når en
 * type er valgt, en række med typens kategorier. Typen er enkeltvalg (en
 * opskrift har én vin); kategorierne kan vælges flere ad gangen.
 */
export function WineFilterChips({
  type,
  styleIds,
  onTypeChange,
  onStylesChange,
  typeCounts,
  styleCounts,
}: {
  type: string | null;
  styleIds: string[];
  onTypeChange: (type: string | null) => void;
  onStylesChange: (ids: string[]) => void;
  /** Antal opskrifter pr. vintype (wine_label) */
  typeCounts: Map<string, number>;
  /** Antal opskrifter pr. kategori */
  styleCounts: Map<string, number>;
}) {
  const { data: styles = [] } = useWineStyles();
  const types = useMemo(() => {
    const seen = new Map<string, WineStyle>();
    for (const s of styles) if (!seen.has(s.wine_label)) seen.set(s.wine_label, s);
    return [...seen.entries()];
  }, [styles]);
  const typeStyles = styles.filter((s) => s.wine_label === type);

  if (styles.length === 0) return null;

  const chip = (opts: {
    key: string;
    label: string;
    active: boolean;
    count: number;
    style?: WineStyle;
    onClick: () => void;
  }) => (
    <button key={opts.key} type="button" onClick={opts.onClick}>
      <Badge
        variant={opts.active ? "default" : "outline"}
        className={opts.active ? "gap-1.5" : "gap-1.5 bg-card font-normal"}
      >
        {opts.style && <TypeDot style={opts.style} />}
        {opts.label}
        <span className={opts.active ? "opacity-75" : "text-muted-foreground"}>{opts.count}</span>
      </Badge>
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="grid gap-1.5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
        <span className="heading-sm text-xs font-medium text-muted-foreground sm:pt-1">Vin til retten</span>
        <div className="flex flex-wrap gap-1.5">
          {types.map(([label, first]) =>
            chip({
              key: label,
              label,
              style: first,
              active: type === label,
              count: typeCounts.get(label) ?? 0,
              onClick: () => {
                onTypeChange(type === label ? null : label);
                onStylesChange([]);
              },
            }),
          )}
        </div>
      </div>
      {type && typeStyles.length > 1 && (
        <div className="grid gap-1.5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
          <span className="heading-sm text-xs font-medium text-muted-foreground sm:pt-1">
            {type}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {typeStyles.map((s) =>
              chip({
                key: s.id,
                label: s.style,
                active: styleIds.includes(s.id),
                count: styleCounts.get(s.id) ?? 0,
                onClick: () =>
                  onStylesChange(
                    styleIds.includes(s.id)
                      ? styleIds.filter((x) => x !== s.id)
                      : [...styleIds, s.id],
                  ),
              }),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Kategorivælger (bruges også i opskriftsformularen) ─────────────────────

const NONE = "__none__";

/** Dropdown med de faste vinkategorier, grupperet efter type. `null` = ingen kategori. */
export function WineStyleSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string | null;
  onChange: (styleId: string | null) => void;
}) {
  const { data: styles = [] } = useWineStyles();
  const groups = useMemo(() => {
    const m = new Map<string, WineStyle[]>();
    for (const s of styles) m.set(s.wine_label, [...(m.get(s.wine_label) ?? []), s]);
    return [...m.entries()];
  }, [styles]);

  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger id={id} className="bg-card">
        <SelectValue placeholder="Vælg kategori" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Ingen kategori</SelectItem>
        {groups.map(([label, items]) => (
          <SelectGroup key={label}>
            <SelectLabel>{label}</SelectLabel>
            {items.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <TypeDot style={s} />
                  {s.style}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Redigering ─────────────────────────────────────────────────────────────

function WineEditDialog({
  open,
  onOpenChange,
  recipeId,
  styleId,
  suggestion,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  recipeId: string;
  styleId: string | null;
  suggestion: string | null;
}) {
  const qc = useQueryClient();
  const [sel, setSel] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSel(styleId);
    setText(suggestion ?? "");
  }, [open, styleId, suggestion]);

  async function save(next: { wine_style_id: string | null; wine_suggestion: string }, msg: string) {
    setBusy(true);
    try {
      await saveRecipeWine(recipeId, next);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["recipe", recipeId] }),
        qc.invalidateQueries({ queryKey: ["recipes"] }),
      ]);
      toast.success(msg);
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vin til retten</DialogTitle>
          <DialogDescription>
            Kategorien bruges til at finde vine i vinkøleskabet. Forslaget er fri tekst, fx
            områder og druer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wine-style">Kategori</Label>
            <WineStyleSelect id="wine-style" value={sel} onChange={setSel} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wine-suggestion">Forslag til områder og druer</Label>
            <Textarea
              id="wine-suggestion"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Fx Barbera d'Asti, Chianti Classico, Valpolicella Classico"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {(styleId || suggestion) && (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              disabled={busy}
              onClick={() => save({ wine_style_id: null, wine_suggestion: "" }, "Vinforslaget er fjernet")}
            >
              Fjern forslag
            </Button>
          )}
          <Button
            disabled={busy}
            onClick={() =>
              save(
                { wine_style_id: sel, wine_suggestion: text },
                "Vinforslaget er gemt",
              )
            }
          >
            Gem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Vine på lager ──────────────────────────────────────────────────────────

const PLURAL: Record<string, string> = {
  Rødvin: "rødvine",
  Hvidvin: "hvidvine",
  Rosé: "roséer",
  Mousserende: "mousserende vine",
  Dessertvin: "dessertvine",
};

function placementLabel(p: WinePlacement) {
  const side = p.depth === 1 ? "forrest" : "bagerst";
  return `Hylde ${p.shelf} — ${side}, plads ${p.slot}${p.layer === 2 ? " (øverste lag)" : ""}`;
}

function WineStockDialog({
  open,
  onOpenChange,
  style,
  styles,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  style: WineStyle;
  styles: WineStyle[];
}) {
  const { data: wines = [], isLoading, error } = useWinesForStyle(style.id, open);
  const exact = wines.filter((w) => w.match === "praecis");
  const near = wines.filter((w) => w.match !== "praecis");
  const typeName = style.wine_label.toLowerCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vine på lager</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <TypeDot style={style} />
            {style.wine_label} · {style.style}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Henter vinkøleskabet…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{(error as Error).message}</p>
        ) : wines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Der er ingen {typeName} i vinkøleskabet lige nu.
          </p>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="heading-sm mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Passer til retten
              </h3>
              {exact.length ? (
                <WineList wines={exact} styles={styles} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ingen vine i præcis denne kategori. Se nærmeste bud herunder.
                </p>
              )}
            </div>
            {near.length > 0 && (
              <div>
                <h3 className="heading-sm mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Nærmeste bud
                </h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  Andre {PLURAL[style.wine_label] ?? typeName}, med de nærmeste kategorier først.
                </p>
                <WineList wines={near} styles={styles} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function WineList({ wines, styles }: { wines: StockWine[]; styles: WineStyle[] }) {
  return (
    <Card className="divide-y divide-border">
      {wines.map((w) => {
        const ws = styles.find((s) => s.id === w.style_id);
        const origin = [w.region, w.country].filter(Boolean).join(", ");
        return (
          <div key={w.wine_id} className="flex gap-3 px-4 py-3">
            {w.image_url ? (
              <img
                src={w.image_url}
                alt=""
                className="h-14 w-10 shrink-0 rounded object-cover"
                loading="lazy"
              />
            ) : (
              <span className="mt-1.5">
                <TypeDot style={ws} />
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-medium">
                  {w.name}
                  {w.vintage ? <span className="text-muted-foreground"> {w.vintage}</span> : null}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {w.bottles} fl.
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {[w.producer, origin].filter(Boolean).join(" · ")}
              </p>
              {w.match !== "praecis" && (
                <p className="text-xs text-muted-foreground">
                  {ws ? ws.style : "Ingen kategori endnu"}
                </p>
              )}
              <ul className="pt-0.5 text-xs text-muted-foreground">
                {w.placements.map((p, i) => (
                  <li key={i}>{placementLabel(p)}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
