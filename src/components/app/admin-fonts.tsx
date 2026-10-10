import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  saveSetting,
  useSettings,
  DEFAULT_APP_NAME,
  DEFAULT_HEADING_SCALE,
  type HeadingScale,
} from "@/lib/queries";
import { FONT_OPTIONS, applyHeadingScale, fontHref, fontStack, type FontKey } from "@/lib/fonts";

/** Valg af skrifttype til sidens titel og til overskrifter. */
export function AdminFonts() {
  const qc = useQueryClient();
  const { data } = useSettings();
  const heading = data?.headingFont ?? "default";
  const title = data?.titleFont ?? "default";
  const [scale, setScale] = useState<HeadingScale>(DEFAULT_HEADING_SCALE);
  const [scaleBusy, setScaleBusy] = useState(false);

  useEffect(() => {
    if (data) setScale(data.headingScale);
  }, [data]);

  // Forlader man siden uden at gemme, vendes tilbage til den gemte størrelse
  useEffect(() => {
    return () => {
      if (data) applyHeadingScale(data.headingScale.main, data.headingScale.sub, data.headingScale.small);
    };
  }, [data]);

  // Vis ændringen live på hele siden, mens man trækker i skyderen
  const changeScale = (next: HeadingScale) => {
    setScale(next);
    applyHeadingScale(next.main, next.sub, next.small);
  };

  async function saveScale() {
    setScaleBusy(true);
    try {
      await saveSetting("heading_scale", scale);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Størrelse gemt");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setScaleBusy(false);
    }
  }

  const scaleChanged =
    !!data &&
    (scale.main !== data.headingScale.main ||
      scale.sub !== data.headingScale.sub ||
      scale.small !== data.headingScale.small);

  // Indlæs alle valgmulighederne, så forhåndsvisningen i listen er korrekt
  useEffect(() => {
    const href = fontHref(FONT_OPTIONS.map((f) => f.key));
    if (!href || document.getElementById("app-fonts-preview")) return;
    const link = document.createElement("link");
    link.id = "app-fonts-preview";
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  }, []);

  async function save(key: "heading_font" | "title_font", value: FontKey) {
    try {
      await saveSetting(key, value);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Skrifttype gemt");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const picker = (id: string, value: FontKey, onChange: (v: FontKey) => void) => (
    <Select value={value} onValueChange={(v) => onChange(v as FontKey)}>
      <SelectTrigger id={id} className="w-full sm:w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FONT_OPTIONS.map((f) => (
          <SelectItem key={f.key} value={f.key}>
            <span style={{ fontFamily: f.stack }}>{f.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">Skrifttyper</h2>
        <p className="text-sm text-muted-foreground">Gælder for alle temaer.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title-font">Sidens titel</Label>
          {picker("title-font", title, (v) => save("title_font", v))}
          <p className="truncate text-2xl" style={{ fontFamily: fontStack(title) }}>
            {data?.appName ?? DEFAULT_APP_NAME}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="heading-font">Overskrifter</Label>
          {picker("heading-font", heading, (v) => save("heading_font", v))}
          <p className="truncate text-2xl" style={{ fontFamily: fontStack(heading) }}>
            Ugens opskrifter
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div>
          <h3 className="font-medium">Størrelse på overskrifter</h3>
          <p className="text-xs text-muted-foreground">
            Ændringen vises med det samme på siden. Tryk “Gem” for at beholde den.
          </p>
        </div>
        {(
          [
            { key: "main", label: "Sideoverskrifter (fx “Opskrifter”)" },
            { key: "sub", label: "Underoverskrifter (fx “Ingredienser”, ugedage, kategorier)" },
            { key: "small", label: "Små overskrifter (fx “weekend”, datoer, afsnit)" },
          ] as const
        ).map((row) => (
          <div key={row.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{row.label}</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{scale[row.key]} %</span>
            </div>
            <Slider
              min={70}
              max={180}
              step={5}
              value={[scale[row.key]]}
              onValueChange={([v]) => changeScale({ ...scale, [row.key]: v })}
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button onClick={saveScale} disabled={scaleBusy || !scaleChanged}>
            Gem
          </Button>
          <Button
            variant="ghost"
            onClick={() => changeScale(DEFAULT_HEADING_SCALE)}
            disabled={scaleBusy}
          >
            Nulstil
          </Button>
        </div>
      </div>
    </Card>
  );
}
