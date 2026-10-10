import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/format";

/** Visning af en (gennemsnits)score med halve stjerner. */
export function StarsDisplay({
  value,
  count,
  size = "sm",
  showEmptyText = true,
}: {
  value: number | null;
  count?: number;
  size?: "sm" | "md";
  showEmptyText?: boolean;
}) {
  const cls = size === "md" ? "h-5 w-5" : "h-4 w-4";
  if (value == null) {
    return showEmptyText ? (
      <span className="text-xs text-muted-foreground">Ingen vurderinger endnu</span>
    ) : null;
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((n) => {
          const fill = Math.max(0, Math.min(1, value - (n - 1)));
          return (
            <span key={n} className={cn("relative", cls)}>
              <Star className={cn("absolute inset-0 text-muted-foreground/35", cls)} />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${Math.round(fill * 2) * 50}%` }}
                >
                  <Star className={cn("fill-primary text-primary", cls)} />
                </span>
              )}
            </span>
          );
        })}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatScore(value)}
        {count != null && ` (${count})`}
      </span>
    </span>
  );
}

/** Valg af score 1–5. */
export function StarsInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} stjerner`}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="p-1 transition-transform hover:scale-110 disabled:opacity-60"
        >
          <Star
            className={cn(
              "h-8 w-8",
              n <= display ? "fill-primary text-primary" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
