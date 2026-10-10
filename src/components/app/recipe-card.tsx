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
        <div className="aspect-[4/3] w-full bg-muted">
          <RecipeImage src={recipe.image_url} alt={recipe.title} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-serif text-xl leading-tight">{recipe.title}</h3>
          <StarsDisplay value={recipe.avg_score} count={recipe.rating_count} />
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {recipe.prep_minutes ? (
              <span className="inline-flex items-center gap-1">
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
            <div className="mt-auto flex flex-wrap gap-1 pt-1">
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
