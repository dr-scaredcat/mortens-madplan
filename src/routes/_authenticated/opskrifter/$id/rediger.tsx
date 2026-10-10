import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RecipeForm, initialFromRecipe } from "@/components/app/recipe-form";
import { useRecipe } from "@/lib/queries";
import { deleteRecipe, removeStoredImage } from "@/lib/mutations";

export const Route = createFileRoute("/_authenticated/opskrifter/$id/rediger")({
  head: () => ({ meta: [{ title: "Redigér opskrift — Astons Køkken" }] }),
  component: EditRecipePage,
});

function EditRecipePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: recipe, isLoading } = useRecipe(id);

  if (isLoading) return <main className="mx-auto max-w-2xl px-4 py-6 text-muted-foreground">Indlæser…</main>;
  if (!recipe) return <main className="mx-auto max-w-2xl px-4 py-6">Opskriften findes ikke.</main>;

  async function onDelete() {
    if (!recipe) return;
    if (
      !confirm(
        `Slet “${recipe.title}”? Vurderinger, noter og historik for retten slettes også. Det kan ikke fortrydes.`,
      )
    )
      return;
    try {
      await deleteRecipe(recipe.id);
      await removeStoredImage(recipe.image_url).catch(() => undefined);
      qc.removeQueries({ queryKey: ["recipe", recipe.id] });
      await qc.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Opskrift slettet");
      navigate({ to: "/opskrifter" });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-5 font-serif text-3xl">Redigér opskrift</h1>
      <RecipeForm
        initial={initialFromRecipe(recipe)}
        recipeId={recipe.id}
        onSaved={(rid) => navigate({ to: "/opskrifter/$id", params: { id: rid } })}
        onCancel={() => navigate({ to: "/opskrifter/$id", params: { id } })}
        extraActions={
          <Button type="button" variant="ghost" className="text-destructive" onClick={onDelete}>
            <Trash2 className="mr-1 h-4 w-4" />
            Slet
          </Button>
        }
      />
    </main>
  );
}
