import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteBrand } from "@/components/app/site-brand";
import {
  saveSetting,
  useSettings,
  DEFAULT_APP_NAME,
  DEFAULT_HEADER,
  type HeaderSettings,
} from "@/lib/queries";

/** Logo og titel i toppen af siden (Admin → Temaer). */
export function AdminBrand() {
  const qc = useQueryClient();
  const { data } = useSettings();
  const [header, setHeader] = useState<HeaderSettings>(DEFAULT_HEADER);
  const [headerBusy, setHeaderBusy] = useState(false);

  useEffect(() => {
    if (data) setHeader(data.header);
  }, [data]);

  const headerChanged = !!data && JSON.stringify(header) !== JSON.stringify(data.header);

  async function saveHeader() {
    setHeaderBusy(true);
    try {
      await saveSetting("header", header);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Logo gemt");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setHeaderBusy(false);
    }
  }

  const SLIDERS: { key: keyof Omit<HeaderSettings, "logoType">; label: string; min: number; max: number }[] = [
    { key: "logoSize", label: "Logostørrelse", min: 8, max: 120 },
    { key: "textSize", label: "Tekststørrelse", min: 8, max: 80 },
    { key: "gap", label: "Afstand horisontalt", min: 0, max: 60 },
    { key: "logoOffsetY", label: "Logo lodret placering", min: -40, max: 40 },
    { key: "textOffsetY", label: "Tekst lodret placering", min: -40, max: 40 },
  ];

  return (
    <Card className="space-y-5 p-4">
      <div>
        <h2 className="text-lg font-semibold">Logo og titel</h2>
        <p className="text-sm text-muted-foreground">
          Eget logo hentes fra <code>public/custom-logo.png</code> i GitHub-projektet. Findes
          filen ikke, vises gryden.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Logo</Label>
        <Select
          value={header.logoType}
          onValueChange={(v) => setHeader((h) => ({ ...h, logoType: v as HeaderSettings["logoType"] }))}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Eget logo (custom-logo.png)</SelectItem>
            <SelectItem value="pot">Gryde (indbygget)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {SLIDERS.map((sl) => (
        <div key={sl.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{sl.label}</Label>
            <span className="text-sm tabular-nums text-muted-foreground">{header[sl.key]}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-7 text-right text-xs text-muted-foreground">{sl.min}</span>
            <Slider
              min={sl.min}
              max={sl.max}
              step={1}
              value={[header[sl.key]]}
              onValueChange={([v]) => setHeader((h) => ({ ...h, [sl.key]: v }))}
              className="flex-1"
            />
            <span className="w-7 text-xs text-muted-foreground">{sl.max}</span>
          </div>
        </div>
      ))}

      <div>
        <Label className="mb-2 block">Forhåndsvisning</Label>
        <div className="flex min-h-16 items-center overflow-hidden rounded-lg border border-border bg-background px-4 py-3">
          <SiteBrand name={data?.appName ?? DEFAULT_APP_NAME} header={header} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={saveHeader} disabled={headerBusy || !headerChanged}>
          Gem logo
        </Button>
        <Button
          variant="ghost"
          onClick={() => setHeader(DEFAULT_HEADER)}
          disabled={headerBusy}
        >
          Nulstil
        </Button>
      </div>
    </Card>
  );
}
