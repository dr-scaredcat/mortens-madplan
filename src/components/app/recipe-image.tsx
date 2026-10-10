import { CookingPot } from "lucide-react";
import { cn } from "@/lib/utils";

/** Opskriftsbillede der fylder sin boks, med en neutral pladsholder. */
export function RecipeImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40",
          className,
        )}
      >
        <CookingPot className="h-1/3 w-1/3" strokeWidth={1.25} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
