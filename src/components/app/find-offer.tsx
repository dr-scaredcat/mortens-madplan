import { BadgePercent } from "lucide-react";
import { cn } from "@/lib/utils";

/** Søgesiden på eTilbudsavis for en vare, fx https://etilbudsavis.dk/soeg/sm%C3%B8r */
export function offerSearchUrl(name: string) {
  return `https://etilbudsavis.dk/soeg/${encodeURIComponent(name.trim())}`;
}

/**
 * "Find tilbud": åbner eTilbudsavis' søgning på varen i browseren. Appen henter
 * ingen tilbudsdata selv – man filtrerer på butikker inde på eTilbudsavis.
 */
export function FindOfferButton({
  name,
  withLabel = false,
  className,
}: {
  name: string;
  /** Vis teksten "Find tilbud" ved siden af ikonet */
  withLabel?: boolean;
  className?: string;
}) {
  if (!name.trim()) return null;
  return (
    <a
      href={offerSearchUrl(name)}
      target="_blank"
      rel="noopener noreferrer"
      title={`Find tilbud på ${name}`}
      aria-label={`Find tilbud på ${name}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-md text-muted-foreground transition hover:bg-accent hover:text-primary",
        withLabel ? "h-9 px-3 text-sm" : "h-8 w-8",
        className,
      )}
    >
      <BadgePercent className="h-4 w-4" />
      {withLabel && <span>Find tilbud</span>}
    </a>
  );
}
