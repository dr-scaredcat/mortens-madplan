import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, unwrap } from "@/lib/supabase";
import { useTagGroups, useTags } from "@/lib/queries";
import type { Tag, TagGroup } from "@/lib/types";

export function AdminTags() {
  const qc = useQueryClient();
  const { data: groups = [] } = useTagGroups();
  const { data: tags = [] } = useTags();
  const [newGroup, setNewGroup] = useState("");

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["tags"] }),
      qc.invalidateQueries({ queryKey: ["tag-groups"] }),
      qc.invalidateQueries({ queryKey: ["recipes"] }),
    ]);

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const updateGroup = (g: TagGroup, patch: Partial<TagGroup>) =>
    run(async () => unwrap(await supabase.from("tag_groups").update(patch).eq("id", g.id)));
  const updateTag = (t: Tag, patch: Partial<Tag>) =>
    run(async () => unwrap(await supabase.from("tags").update(patch).eq("id", t.id)));

  async function moveGroup(idx: number, dir: -1 | 1) {
    const to = idx + dir;
    if (to < 0 || to >= groups.length) return;
    const arr = [...groups];
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    await run(() =>
      Promise.all(
        arr.map((g, i) =>
          supabase.from("tag_groups").update({ sort_order: (i + 1) * 10 }).eq("id", g.id).then(unwrap),
        ),
      ),
    );
  }

  async function addGroup() {
    if (!newGroup.trim()) return;
    const max = groups.reduce((m, g) => Math.max(m, g.sort_order), 0);
    await run(async () =>
      unwrap(await supabase.from("tag_groups").insert({ name: newGroup.trim(), sort_order: max + 10 })),
    );
    setNewGroup("");
  }

  const sections: { group: TagGroup | null; tags: Tag[] }[] = [
    ...groups.map((g) => ({ group: g, tags: tags.filter((t) => t.group_id === g.id) })),
    { group: null, tags: tags.filter((t) => !t.group_id) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Tags</h2>
        <p className="text-sm text-muted-foreground">
          Tags bruges til søgning og ugeplan. Tags i en gruppe markeret som{" "}
          <em>hovedingrediens</em> bruges til at variere ugen, og tags markeret som{" "}
          <em>weekendmad</em> foretrækkes fredag og lørdag. Opskrifter med et tag markeret{" "}
          <em>aldrig i ugeplan</em> foreslås aldrig automatisk, men kan stadig vælges manuelt.
        </p>
      </div>

      {sections.map(({ group, tags: groupTags }, idx) =>
        !group && groupTags.length === 0 ? null : (
          <Card key={group?.id ?? "none"} className="space-y-3 p-4">
            {group ? (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  defaultValue={group.name}
                  className="h-9 max-w-xs flex-1 font-medium"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== group.name) void updateGroup(group, { name: v });
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Switch
                    checked={group.is_main_ingredient}
                    onCheckedChange={(v) => updateGroup(group, { is_main_ingredient: v })}
                  />
                  Hovedingrediens
                </label>
                <div className="ml-auto flex">
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === 0} onClick={() => moveGroup(idx, -1)} aria-label="Flyt op">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={idx === groups.length - 1} onClick={() => moveGroup(idx, 1)} aria-label="Flyt ned">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label="Slet gruppe"
                    onClick={() => {
                      if (!confirm(`Slet gruppen “${group.name}”? Dens tags flyttes til “Andre”.`)) return;
                      void run(async () =>
                        unwrap(await supabase.from("tag_groups").delete().eq("id", group.id)),
                      );
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="font-medium">Andre (uden gruppe)</p>
            )}

            <ul className="space-y-1.5">
              {groupTags.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-2">
                  <Input
                    defaultValue={t.name}
                    className="h-8 max-w-[14rem] flex-1"
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== t.name) void updateTag(t, { name: v });
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  />
                  <Select
                    value={t.group_id ?? "none"}
                    onValueChange={(v) => updateTag(t, { group_id: v === "none" ? null : v })}
                  >
                    <SelectTrigger className="h-8 w-40 text-xs" aria-label="Gruppe">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ingen gruppe</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch
                      checked={t.is_weekend}
                      onCheckedChange={(v) => updateTag(t, { is_weekend: v })}
                    />
                    Weekendmad
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch
                      checked={t.exclude_from_planner}
                      onCheckedChange={(v) => updateTag(t, { exclude_from_planner: v })}
                    />
                    Aldrig i ugeplan
                  </label>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Slet ${t.name}`}
                    onClick={() => {
                      if (!confirm(`Slet tagget “${t.name}”? Det fjernes fra alle opskrifter.`)) return;
                      void run(async () => unwrap(await supabase.from("tags").delete().eq("id", t.id)));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <NewTag
              onAdd={(name) =>
                run(async () => {
                  const max = groupTags.reduce((m, t) => Math.max(m, t.sort_order), 0);
                  unwrap(
                    await supabase
                      .from("tags")
                      .insert({ name, group_id: group?.id ?? null, sort_order: max + 10 }),
                  );
                })
              }
            />
          </Card>
        ),
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Ny tag-gruppe"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGroup()}
        />
        <Button onClick={addGroup} disabled={!newGroup.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          Tilføj gruppe
        </Button>
      </div>
    </div>
  );
}

function NewTag({ onAdd }: { onAdd: (name: string) => Promise<unknown> }) {
  const [name, setName] = useState("");
  const submit = async () => {
    if (!name.trim()) return;
    await onAdd(name.trim());
    setName("");
  };
  return (
    <div className="flex gap-2">
      <Input
        className="h-8 max-w-[14rem]"
        placeholder="Nyt tag"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <Button size="sm" variant="outline" onClick={submit} disabled={!name.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
