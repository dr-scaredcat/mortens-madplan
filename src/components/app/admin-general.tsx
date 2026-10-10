import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSetting, useSettings, DEFAULT_APP_NAME } from "@/lib/queries";

export function AdminGeneral() {
  const qc = useQueryClient();
  const { data } = useSettings();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) setName(data.appName);
  }, [data]);

  async function save() {
    const v = name.trim() || DEFAULT_APP_NAME;
    setBusy(true);
    try {
      await saveSetting("app_name", v);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Navn gemt");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div>
          <h2 className="text-lg font-semibold">App-navn</h2>
          <p className="text-sm text-muted-foreground">
            Vises øverst i appen og bruges når appen installeres på hjemmeskærmen. En allerede
            installeret app skal typisk geninstalleres for at få det nye navn under ikonet.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="appname" className="sr-only">
              App-navn
            </Label>
            <Input
              id="appname"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder={DEFAULT_APP_NAME}
            />
          </div>
          <Button onClick={save} disabled={busy || name.trim() === data?.appName}>
            Gem
          </Button>
        </div>
      </Card>

    </div>
  );
}
