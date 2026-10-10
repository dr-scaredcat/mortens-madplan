import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { importRecipeFromUrl, type ImportedRecipe } from "@/lib/recipe-import.functions";

export function ImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onImported: (r: ImportedRecipe) => void;
}) {
  const importFn = useServerFn(importRecipeFromUrl);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    setBusy(true);
    try {
      const r = await importFn({ data: { url: target } });
      onImported(r);
      onOpenChange(false);
      setUrl("");
      const missing = r.ingredients.length === 0 ? " (ingen ingredienser fundet)" : "";
      toast.success(`Importeret: ${r.title}${missing}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent>
        <form onSubmit={run} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Importér fra link</DialogTitle>
            <DialogDescription>
              Indsæt et link til en opskrift fra en madside. Titel, billede, ingredienser og
              fremgangsmåde udfyldes — du kan rette det hele, før du gemmer.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="url"
            inputMode="url"
            placeholder="https://www.valdemarsro.dk/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button type="submit" disabled={busy || !url.trim()}>
              {busy ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-1 h-4 w-4" />
              )}
              {busy ? "Henter…" : "Importér"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
