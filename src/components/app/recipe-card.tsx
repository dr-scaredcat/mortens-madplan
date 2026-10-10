import { Link } from "@tanstack/react-router";
import { Clock, CalendarCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarsDisplay } from "@/components/app/rating-stars";
import { RecipeImage } from "@/components/app/recipe-image";
import { formatAgo, formatMinutes } from "@/lib/format";
import type { RecipeListItem, Tag } from "@/lib/types";

export function RecipeCard({ recipe, tags }: { recipe: RecipeListItem; tags: Map<string, Tag> }) {
  const recipeTags = recipe.tag_ids
    .map((id) => tags.get(id))
    .filter((t): t is Tag => !!t)
    .sort((a, b) => Number(b.is_weekend) - Number(a.is_weekend) || a.name.localeCompare(b.name));

  return (
    <Link to="/opskrifter/$id" params={{ id: recipe.id }} className="group block">
      <Card className="flex h-full flex-col overflow-hidden border-border/70 bg-card transition group-hover:border-primary/50">
        {/* Fast 4:3-felt, så høje billeder beskæres i stedet for at strække kortet */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
          <RecipeImage src={recipe.image_url} alt={recipe.title} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4">
          <h3 className="font-serif text-base leading-tight sm:text-xl">{recipe.title}</h3>
          <StarsDisplay value={recipe.avg_score} count={recipe.rating_count} />
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground sm:gap-y-1 sm:text-xs">
            {recipe.prep_minutes ? (
              <span className="hidden items-center gap-1 sm:inline-flex">
                <Clock className="h-3.5 w-3.5" />
                {formatMinutes(recipe.prep_minutes)}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <CalendarCheck className="h-3.5 w-3.5" />
              {recipe.last_eaten ? `Spist ${formatAgo(recipe.last_eaten)}` : "Ikke spist endnu"}
            </span>
          </div>
          {recipeTags.length > 0 && (
            <div className="mt-auto hidden flex-wrap gap-1 pt-1 sm:flex">
              {recipeTags.map((t) => (
                <Badge
                  key={t.id}
                  variant={t.is_weekend ? "default" : "secondary"}
                  className="text-xs"
                >
                  {t.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
