import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveSetting, useSettings } from "@/lib/queries";
import { WEEKDAYS } from "@/lib/format";
import { DEFAULT_PLANNER, type PlanDayKind, type PlannerSettings, type WeekTemplate } from "@/lib/types";

const KIND_LABELS: Record<PlanDayKind, string> = {
  recipe: "Opskrift",
  rugbrod: "Rugbrød",
  ude: "Spiser ude",
  rester: "Rester",
  fri: "Andet",
};

const FIELDS: { key: keyof PlannerSettings; label: string; help: string; min: number; max: number }[] = [
  {
    key: "weekendFactor",
    label: "Weekend-vægt",
    help: "Hvor meget mere weekendmad vælges fredag og lørdag (og hvor meget sjældnere andre dage). 1 = ingen forskel.",
    min: 1,
    max: 20,
  },
  {
    key: "excludeDays",
    label: "Pause mellem samme ret (dage)",
    help: "En ret spist for nylig foreslås ikke igen inden for dette antal dage.",
    min: 0,
    max: 120,
  },
  {
    key: "maxMainPerWeek",
    label: "Maks. samme hovedingrediens pr. uge",
    help: "Fx højst 2 dage med kylling. Bruger tags i grupper markeret som hovedingrediens.",
    min: 1,
    max: 7,
  },
  {
    key: "defaultServings",
    label: "Standard antal personer",
    help: "Bruges i ugeplanen og for nye opskrifter.",
    min: 1,
    max: 20,
  },
];

export function AdminPlanner() {
  const qc = useQueryClient();
  const { data } = useSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [template, setTemplate] = useState<WeekTemplate>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    setValues(Object.fromEntries(FIELDS.map((f) => [f.key, String(data.planner[f.key])])));
    setTemplate(
      Object.fromEntries(
        [1, 2, 3, 4, 5, 6, 7].map((d) => [String(d), data.weekTemplate[String(d)] ?? "recipe"]),
      ) as WeekTemplate,
    );
  }, [data]);

  async function save() {
    const planner: PlannerSettings = { ...DEFAULT_PLANNER, ...(data?.planner ?? {}) };
    for (const f of FIELDS) {
      const n = Number(values[f.key]);
      if (!Number.isFinite(n) || n < f.min || n > f.max) {
        return toast.error(`${f.label}: skal være mellem ${f.min} og ${f.max}`);
      }
      planner[f.key] = Math.round(n * 10) / 10;
    }
    setBusy(true);
    try {
      await saveSetting("planner", planner);
      await saveSetting("week_template", template);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Indstillinger gemt");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Ugeplan</h2>
        <p className="text-sm text-muted-foreground">
          Styr hvordan forslagene laves. Score og tid siden sidst indgår altid.
        </p>
      </div>

      <Card className="space-y-4 p-4">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5 sm:grid-cols-[1fr_7rem] sm:items-center">
            <div>
              <Label htmlFor={f.key}>{f.label}</Label>
              <p className="text-xs text-muted-foreground">{f.help}</p>
            </div>
            <Input
              id={f.key}
              type="number"
              inputMode="decimal"
              min={f.min}
              max={f.max}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-4">
        <div>
          <h3 className="font-medium">Standarduge</h3>
          <p className="text-xs text-muted-foreground">
            Udgangspunktet for en ny uge. Hver uge kan stadig ændres frit i ugeplanen.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {WEEKDAYS.map((name, i) => {
            const key = String(i + 1);
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="w-20 text-sm">{name}</span>
                <Select
                  value={template[key] ?? "recipe"}
                  onValueChange={(v) => setTemplate((t) => ({ ...t, [key]: v as PlanDayKind }))}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KIND_LABELS) as PlanDayKind[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {KIND_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </Card>

      <Button onClick={save} disabled={busy || !data}>
        Gem
      </Button>
    </div>
  );
}
