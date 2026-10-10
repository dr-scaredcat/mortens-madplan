import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { RecipeImage } from "@/components/app/recipe-image";
import { fetchRatingPrompts, useMe } from "@/lib/queries";
import { dismissRatingPrompt, saveRating, syncMealLog } from "@/lib/mutations";
import { daysBetween, formatDate, todayISO, WEEKDAYS } from "@/lib/format";
import { isoWeekday } from "@/lib/planner";

/**
 * Når appen åbnes: registrér passerede dage i ugeplanen som spist, og spørg
 * "Hvordan var …?" for måltider fra den seneste uge, som man ikke har vurderet.
 */
export function RatingPrompt() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const [synced, setSynced] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (!me?.isMember || ran.current) return;
    ran.current = true;
    syncMealLog()
      .catch(() => undefined)
      .finally(() => {
        setSynced(true);
        void qc.invalidateQueries({ queryKey: ["recipes"] });
      });
  }, [me?.isMember, qc]);

  const { data: prompts = [] } = useQuery({
    queryKey: ["rating-prompts", me?.userId],
    queryFn: () => fetchRatingPrompts(me!.userId),
    enabled: synced && !!me?.userId,
    staleTime: 5 * 60_000,
  });

  const current = prompts[0] ?? null;
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [closedForSession, setClosedForSession] = useState(false);

  useEffect(() => {
    setScore(0);
    setNote("");
  }, [current?.meal.id]);

  if (!current || closedForSession) return null;

  const days = daysBetween(current.meal.eaten_on, todayISO());
  const when =
    days === 1
      ? "i går"
      : days < 7
        ? `i ${WEEKDAYS[isoWeekday(current.meal.eaten_on) - 1].toLowerCase()}s`
        : formatDate(current.meal.eaten_on);

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["rating-prompts"] }),
      qc.invalidateQueries({ queryKey: ["recipes"] }),
      qc.invalidateQueries({ queryKey: ["recipe", current.recipe.id] }),
    ]);

  async function submit() {
    if (!current || !score) return;
    setBusy(true);
    try {
      await saveRating({
        recipe_id: current.recipe.id,
        meal_log_id: current.meal.id,
        score,
        note,
      });
      await refresh();
      toast.success("Tak for din vurdering");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    if (!current) return;
    setBusy(true);
    try {
      await dismissRatingPrompt(current.meal.id);
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && setClosedForSession(true)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hvordan var den?</DialogTitle>
          <DialogDescription>
            I fik <strong>{current.recipe.title}</strong> {when}.
          </DialogDescription>
        </DialogHeader>
        {current.recipe.image_url && (
          <div className="aspect-[16/9] overflow-hidden rounded-md">
            <RecipeImage src={current.recipe.image_url} alt={current.recipe.title} />
          </div>
        )}
        <div className="flex justify-center">
          <StarsInput value={score} onChange={setScore} disabled={busy} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="prompt-note">Note til næste gang (valgfri)</Label>
          <Textarea
            id="prompt-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="fx “brug mindre chili”"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={skip} disabled={busy}>
            Spring over
          </Button>
          <Button onClick={submit} disabled={busy || !score}>
            Gem
          </Button>
        </DialogFooter>
        {prompts.length > 1 && (
          <p className="text-center text-xs text-muted-foreground">
            {prompts.length - 1} mere bagefter
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
