import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { StarsInput } from "@/components/app/rating-stars";
import { logMeal, saveRating } from "@/lib/mutations";
import { formatDate, todayISO, daysBetween } from "@/lib/format";
import type { MealLog, Rating } from "@/lib/types";

/**
 * Giv en score (og evt. en note til næste gang) for en ret.
 *
 * Er retten spist inden for de sidste 30 dage, uden at man selv har givet den
 * en score, knyttes vurderingen til det måltid. Ellers kan man samtidig
 * registrere, at retten er lavet (som standard i dag).
 */
export function RateDialog({
  open,
  onOpenChange,
  recipeId,
  recipeTitle,
  meals,
  myRatings,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  recipeId: string;
  recipeTitle: string;
  meals: MealLog[];
  myRatings: Rating[];
  /** Eksisterende vurdering der redigeres */
  editing?: Rating | null;
}) {
  const qc = useQueryClient();
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [logIt, setLogIt] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [busy, setBusy] = useState(false);

  const ratedMealIds = new Set(myRatings.map((r) => r.meal_log_id).filter(Boolean));
  const unratedMeal =
    meals.find((m) => !ratedMealIds.has(m.id) && daysBetween(m.eaten_on, todayISO()) <= 30) ??
    null;

  useEffect(() => {
    if (!open) return;
    setScore(editing?.score ?? 0);
    setNote(editing?.note ?? "");
    setLogIt(!editing);
    setDate(todayISO());
  }, [open, editing]);

  async function submit() {
    if (!score) return toast.error("Vælg en score.");
    setBusy(true);
    try {
      let mealId: string | null = editing?.meal_log_id ?? null;
      if (!editing) {
        if (unratedMeal) mealId = unratedMeal.id;
        else if (logIt) mealId = await logMeal(recipeId, date);
      }
      await saveRating({ id: editing?.id, recipe_id: recipeId, meal_log_id: mealId, score, note });
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["recipe", recipeId] }),
        qc.invalidateQueries({ queryKey: ["recipes"] }),
        qc.invalidateQueries({ queryKey: ["rating-prompts"] }),
      ]);
      toast.success("Tak for din vurdering");
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Ret din vurdering" : "Hvordan var den?"}</DialogTitle>
          <DialogDescription>{recipeTitle}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <StarsInput value={score} onChange={setScore} disabled={busy} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">Note til næste gang (valgfri)</Label>
          <Textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="fx “brug mindre chili” eller “dobbelt portion sauce”"
          />
        </div>

        {!editing &&
          (unratedMeal ? (
            <p className="text-xs text-muted-foreground">
              Gælder måltidet {formatDate(unratedMeal.eaten_on)}.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Checkbox id="logit" checked={logIt} onCheckedChange={(v) => setLogIt(v === true)} />
              <Label htmlFor="logit" className="font-normal">
                Registrér at vi har lavet den
              </Label>
              {logIt && (
                <Input
                  type="date"
                  className="h-8 w-40"
                  value={date}
                  max={todayISO()}
                  onChange={(e) => setDate(e.target.value || todayISO())}
                />
              )}
            </div>
          ))}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Annullér
          </Button>
          <Button onClick={submit} disabled={busy || !score}>
            Gem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
