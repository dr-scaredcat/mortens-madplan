import { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseTextRecipe, type ParsedTextRecipe } from "@/lib/text-recipe-parser";

/**
 * Opret en opskrift ud fra fritekst, fx en opskrift genereret af en AI.
 * Teksten fortolkes til titel, ingredienser og trin, som så kan rettes i
 * formularen før den gemmes.
 */
export function TextImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onImported: (r: ParsedTextRecipe) => void;
}) {
  const [text, setText] = useState("");

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setText(t);
    } catch {
      toast.info("Indsæt teksten i feltet med “Sæt ind”.");
    }
  }

  function run() {
    const r = parseTextRecipe(text);
    if (r.ingredients.length === 0 && r.steps.length === 0) {
      toast.error("Kunne ikke finde ingredienser eller fremgangsmåde i teksten.");
      return;
    }
    onImported(r);
    onOpenChange(false);
    setText("");
    toast.success(
      `${r.title}: ${r.ingredients.filter((i) => !/:$/.test(i.raw.trim())).length} ingredienser og ${r.steps.filter((s) => !/:$/.test(s)).length} trin fundet`,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col">
        <DialogHeader>
          <DialogTitle>Opret fra tekst</DialogTitle>
          <DialogDescription>
            Indsæt en opskrift som tekst — fx fra en AI, en mail eller en note. Første linje bliver
            titlen, og ingredienser og fremgangsmåde findes ud fra overskrifter og lister. Du kan
            rette det hele, før du gemmer.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          className="min-h-64 flex-1 font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Kyllingepasta\n\nTil 4 personer\n\nIngredienser:\n- 400 g pasta\n- 500 g kyllingebryst\n\nFremgangsmåde:\n1. Kog pastaen …`}
          autoFocus
        />
        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={pasteFromClipboard}>
            Sæt ind fra udklipsholder
          </Button>
          <Button type="button" onClick={run} disabled={!text.trim()}>
            <FileText className="mr-1 h-4 w-4" />
            Opret fra tekst
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
