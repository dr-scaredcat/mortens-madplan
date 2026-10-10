import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveSetting, useSettings, DEFAULT_APP_NAME } from "@/lib/queries";
import { FONT_OPTIONS, fontHref, fontStack, type FontKey } from "@/lib/fonts";

/** Valg af skrifttype til sidens titel og til overskrifter. */
export function AdminFonts() {
  const qc = useQueryClient();
  const { data } = useSettings();
  const heading = data?.headingFont ?? "default";
  const title = data?.titleFont ?? "default";

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
    </Card>
  );
}
