import { useState } from "react";
import { CookingPot } from "lucide-react";
import { cn } from "@/lib/utils";

/** Er billed-URL'en en PNG? (typisk egne uploads med gennemsigtig baggrund) */
function isPng(url: string): boolean {
  return url.split("?")[0].toLowerCase().endsWith(".png");
}

/**
 * Opskriftsbillede, der fylder sin boks og beskæres til boksens format —
 * ligesom kortene i Astons Bar:
 *  • fotos (JPEG/WebP) vises "cover" og beskæres,
 *  • PNG (fx med gennemsigtig baggrund) vises "contain", centreret,
 *  • uden billede vises public/placeholder-recipe.png (eller en gryde, hvis
 *    filen ikke findes).
 *
 * Boksen omkring skal have en fast størrelse eller et aspect-ratio.
 */
export function RecipeImage({
  src,
  alt,
  className,
  showPlaceholderText = true,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Vis "Billede er på vej…" under pladsholderen (kun på store felter) */
  showPlaceholderText?: boolean;
}) {
  const [placeholderFailed, setPlaceholderFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted text-muted-foreground/40",
          className,
        )}
      >
        {placeholderFailed ? (
          <CookingPot className="h-1/3 w-1/3" strokeWidth={1.25} />
        ) : (
          <img
            src="/placeholder-recipe.png"
            alt=""
            className="h-2/3 w-auto max-w-[80%] object-contain"
            onError={() => setPlaceholderFailed(true)}
          />
        )}
        {showPlaceholderText && (
          <span className="text-xs text-muted-foreground">Billede er på vej…</span>
        )}
      </div>
    );
  }

  if (isPng(src)) {
    return (
      <div className={cn("absolute inset-0 flex items-center justify-center", className)}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="max-h-[80%] max-w-[80%] object-contain"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
