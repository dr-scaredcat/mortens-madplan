import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMe } from "@/lib/queries";
import { AdminGeneral } from "@/components/app/admin-general";
import { AdminThemes } from "@/components/app/admin-themes";
import { AdminAccess } from "@/components/app/admin-access";
import { AdminIngredients } from "@/components/app/admin-ingredients";
import { AdminCategories } from "@/components/app/admin-categories";
import { AdminTags } from "@/components/app/admin-tags";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Astons Køkken" }] }),
  component: AdminPage,
});

const TABS = [
  { value: "general", label: "Generelt" },
  { value: "themes", label: "Temaer" },
  { value: "access", label: "Adgang" },
  { value: "ingredients", label: "Ingredienser" },
  { value: "categories", label: "Kategorier" },
  { value: "tags", label: "Tags" },
];

function AdminPage() {
  const { data: me } = useMe();
  const [tab, setTab] = useState("general");

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 pb-safe">
      <h1 className="mb-1 font-serif text-3xl">Admin</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Indstillinger, temaer, adgang og kataloget over ingredienser, kategorier og tags.
      </p>
      {!me?.isAdmin ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm">
          Din konto har ikke administratorrettigheder.
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <div className="mb-6">
            <Select value={tab} onValueChange={setTab}>
              <SelectTrigger className="w-full bg-card sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TABS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TabsContent value="general">
            <AdminGeneral />
          </TabsContent>
          <TabsContent value="themes">
            <AdminThemes />
          </TabsContent>
          <TabsContent value="access">
            <AdminAccess />
          </TabsContent>
          <TabsContent value="ingredients">
            <AdminIngredients />
          </TabsContent>
          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>
          <TabsContent value="tags">
            <AdminTags />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
