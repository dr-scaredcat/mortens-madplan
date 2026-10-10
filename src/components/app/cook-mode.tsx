import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ListChecks, Pause, Play, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { formatQuantity, scaleAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecipeDetail } from "@/lib/types";

type RunningTimer = {
  id: string;
  label: string;
  endsAt: number;
  pausedLeft: number | null;
  done: boolean;
};

/**
 * Madlavningstilstand: ét trin ad gangen med stor tekst, ingredienser ved
 * hånden, timere og skærmen holdt tændt så længe tilstanden er åben.
 */
export function CookMode({
  recipe,
  servings,
  onClose,
}: {
  recipe: RecipeDetail;
  servings: number;
  onClose: () => void;
}) {
  const wake = useWakeLock(true);
  const [step, setStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(recipe.steps.length === 0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [timers, setTimers] = useState<RunningTimer[]>([]);
  const [, setTick] = useState(0);
  const touchX = useRef<number | null>(null);

  const steps = recipe.steps;
  const current = steps[step];

  // Opdatér visningen hvert sekund
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Afslut timere der er løbet ud (alarmen lyder kun én gang pr. timer)
  const alarmed = useRef(new Set<string>());
  const now = Date.now();
  const expired = timers.filter((t) => !t.done && t.pausedLeft == null && now >= t.endsAt);
  useEffect(() => {
    if (!expired.length) return;
    for (const t of expired) {
      if (alarmed.current.has(t.id)) continue;
      alarmed.current.add(t.id);
      alarm(t.label);
    }
    const ids = new Set(expired.map((t) => t.id));
    setTimers((ts) => ts.map((t) => (ids.has(t.id) ? { ...t, done: true } : t)));
  });

  // Lås baggrunden mens tilstanden er åben, og luk med Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, steps.length]);

  function startTimer(minutes: number, label: string) {
    unlockAudio();
    setTimers((ts) => [
      ...ts,
      {
        id: Math.random().toString(36).slice(2),
        label,
        endsAt: Date.now() + minutes * 60_000,
        pausedLeft: null,
        done: false,
      },
    ]);
  }

  function togglePause(id: string) {
    setTimers((ts) =>
      ts.map((t) =>
        t.id !== id || t.done
          ? t
          : t.pausedLeft != null
            ? { ...t, endsAt: Date.now() + t.pausedLeft, pausedLeft: null }
            : { ...t, pausedLeft: Math.max(0, t.endsAt - Date.now()) },
      ),
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background pt-[env(safe-area-inset-top)]"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null || showIngredients) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -60) setStep((s) => Math.min(s + 1, steps.length - 1));
        if (dx > 60) setStep((s) => Math.max(s - 1, 0));
        touchX.current = null;
      }}
    >
      {/* Top */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <h2 className="min-w-0 flex-1 truncate font-serif text-lg">{recipe.title}</h2>
        <Button
          variant={showIngredients ? "default" : "outline"}
          size="sm"
          onClick={() => setShowIngredients((v) => !v)}
        >
          <ListChecks className="mr-1 h-4 w-4" />
          Ingredienser
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Luk madlavningstilstand">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Timere */}
      {timers.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border px-4 py-2">
          {timers.map((t) => {
            const left = t.pausedLeft ?? Math.max(0, t.endsAt - Date.now());
            return (
              <div
                key={t.id}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm tabular-nums",
                  t.done
                    ? "animate-pulse border-destructive bg-destructive/15 text-destructive"
                    : "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                <Timer className="h-4 w-4" />
                <span className="font-medium">{t.done ? "Færdig!" : formatClock(left)}</span>
                <span className="text-xs opacity-75">{t.label}</span>
                {!t.done && (
                  <button
                    type="button"
                    onClick={() => togglePause(t.id)}
                    aria-label={t.pausedLeft != null ? "Fortsæt" : "Pause"}
                  >
                    {t.pausedLeft != null ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTimers((ts) => ts.filter((x) => x.id !== t.id))}
                  aria-label="Fjern timer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Indhold */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {showIngredients ? (
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 text-sm text-muted-foreground">
              {servings} {servings === 1 ? "person" : "personer"} · tryk for at krydse af
            </p>
            <ul className="space-y-1">
              {recipe.ingredients.map((i) => {
                const done = checked.has(i.id);
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setChecked((s) => {
                          const n = new Set(s);
                          if (n.has(i.id)) n.delete(i.id);
                          else n.add(i.id);
                          return n;
                        })
                      }
                      className={cn(
                        "flex w-full items-baseline justify-between gap-3 rounded-md px-2 py-2 text-left text-xl",
                        done && "text-muted-foreground line-through",
                      )}
                    >
                      <span>
                        {i.ingredient.name}
                        {i.note && <span className="text-base text-muted-foreground">, {i.note}</span>}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatQuantity(scaleAmount(i.amount, recipe.servings, servings), i.unit)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : current ? (
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <p className="text-sm font-medium text-primary">
              Trin {step + 1} af {steps.length}
            </p>
            <p className="text-2xl leading-relaxed sm:text-3xl">{current.text}</p>
            {current.timer_minutes && (
              <Button
                variant="outline"
                size="lg"
                className="self-start"
                onClick={() => startTimer(current.timer_minutes!, `Trin ${step + 1}`)}
              >
                <Timer className="mr-2 h-5 w-5" />
                Start timer · {current.timer_minutes} min
              </Button>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Opskriften har ingen trin.</p>
        )}
      </div>

      {/* Bund */}
      {!showIngredients && steps.length > 0 && (
        <div className="flex items-center gap-3 border-t border-border px-4 py-3 pb-safe">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Forrige
          </Button>
          <div className="flex flex-1 justify-center gap-1.5">
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Gå til trin ${i + 1}`}
                onClick={() => setStep(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
          {step < steps.length - 1 ? (
            <Button size="lg" onClick={() => setStep((s) => s + 1)}>
              Næste
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" onClick={onClose}>
              Færdig
            </Button>
          )}
        </div>
      )}

      {!wake.supported && (
        <p className="px-4 pb-2 text-center text-xs text-muted-foreground">
          Denne browser kan ikke holde skærmen tændt automatisk.
        </p>
      )}
    </div>
  );
}

function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

// ─── Alarm ─────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

/** Lyd skal "låses op" af et tryk i iOS — kaldes når en timer startes. */
function unlockAudio() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && Ctx) audioCtx = new Ctx();
    void audioCtx?.resume();
  } catch {
    // ingen lyd
  }
}

function alarm(label: string) {
  toast.success(`Timer færdig: ${label}`, { duration: 15_000 });
  try {
    navigator.vibrate?.([300, 150, 300, 150, 300]);
  } catch {
    // ignorér
  }
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = now + i * 0.45;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.32);
  }
}
