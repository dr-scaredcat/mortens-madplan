import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RecipeForm,
  emptyInitial,
  rowsFromParsed,
  stepsFromTexts,
  type RecipeFormInitial,
} from "@/components/app/recipe-form";
import { ImportDialog } from "@/components/app/import-dialog";
import { useIngredients, useSettings } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/opskrifter/ny")({
  head: () => ({ meta: [{ title: "Ny opskrift — Astons Køkken" }] }),
  component: NewRecipePage,
});

function NewRecipePage() {
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const { data: catalog = [] } = useIngredients();
  const [importOpen, setImportOpen] = useState(false);
  // Skift nøgle for at genstarte formularen med importerede data
  const [formKey, setFormKey] = useState(0);
  const [initial, setInitial] = useState<RecipeFormInitial | null>(null);

  const base = initial ?? emptyInitial(settings?.planner.defaultServings ?? 4);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <h1 className="font-serif text-3xl">Ny opskrift</h1>
        <Button variant="outline" onClick={() => setImportOpen(true)} className="bg-card">
          <Link2 className="mr-1 h-4 w-4" />
          Importér fra link
        </Button>
      </div>

      <RecipeForm
        key={formKey}
        initial={base}
        onSaved={(id) => navigate({ to: "/opskrifter/$id", params: { id } })}
        onCancel={() => navigate({ to: "/opskrifter" })}
      />

      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={(r) => {
          setInitial({
            title: r.title,
            description: r.description ?? "",
            servings: r.servings ?? settings?.planner.defaultServings ?? 4,
            prep_minutes: r.prepMinutes,
            image_url: r.imageUrl,
            source_url: r.sourceUrl,
            tag_ids: [],
            ingredients: rowsFromParsed(r.ingredients, catalog),
            steps: stepsFromTexts(r.steps),
          });
          setFormKey((k) => k + 1);
        }}
      />
    </main>
  );
}
